import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { MockOcrAdapter } from './mock-ocr.adapter';
import { CreateOcrJobDto } from './dto/create-ocr-job.dto';
import { ReviewOcrJobDto } from './dto/review-ocr-job.dto';
import { QueryOcrJobsDto } from './dto/query-ocr-jobs.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  OcrJobStatus,
  OcrTargetType,
  UserRole,
  Prisma,
} from '@prisma/client';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    private ocrAdapter: MockOcrAdapter,
  ) {}

  /**
   * Asserts user access to the given attachment.
   */
  private async assertAttachmentAccess(attachment: any, user: RequestUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      return;
    }
    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (dbUser?.companyId && attachment.companyId && dbUser.companyId !== attachment.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'Access denied for foreign company attachment',
        });
      }
      return;
    }
    if (user.role === UserRole.MINE_OFFICIAL) {
      if (attachment.mineId) {
        await this.scopeService.assertMineAccess(user, attachment.mineId);
      }
      return;
    }
    if (attachment.uploadedById !== user.id) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied: you can only process your own attachments',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CREATE / TRIGGER OCR JOB (WITH DEDUPLICATION)
  // ═══════════════════════════════════════════════════════════════════════════

  async createJob(dto: CreateOcrJobDto, user: RequestUser) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: dto.attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Attachment "${dto.attachmentId}" not found`,
      });
    }

    await this.assertAttachmentAccess(attachment, user);

    // Validate target scope if specified
    if (dto.targetType && dto.targetId) {
      if (dto.targetType === OcrTargetType.COMPLIANCE_RECORD) {
        const record = await this.prisma.complianceRecord.findUnique({
          where: { id: dto.targetId },
        });
        if (!record) {
          throw new NotFoundException({
            code: 'NOT_FOUND',
            message: `ComplianceRecord "${dto.targetId}" not found`,
          });
        }
        await this.scopeService.assertMineAccess(user, record.mineId);
      } else if (dto.targetType === OcrTargetType.INSPECTION) {
        const insp = await this.prisma.inspection.findUnique({
          where: { id: dto.targetId },
        });
        if (!insp) {
          throw new NotFoundException({
            code: 'NOT_FOUND',
            message: `Inspection "${dto.targetId}" not found`,
          });
        }
        await this.scopeService.assertMineAccess(user, insp.mineId);
      }
    }

    // Deduplication check: Reuse completed job for identical attachment and engine version
    const existingCompleted = await this.prisma.ocrJob.findFirst({
      where: {
        attachmentId: dto.attachmentId,
        engineVersion: this.ocrAdapter.engineVersion,
        status: OcrJobStatus.COMPLETED,
      },
      include: {
        extraction: true,
        attachment: { select: { id: true, fileName: true, mimeType: true, fileSize: true } },
      },
    });

    if (existingCompleted) {
      this.logger.log(`Deduplication hit: Reusing completed OCR Job "${existingCompleted.id}" for attachment "${attachment.fileName}"`);
      return {
        ...existingCompleted,
        deduplicated: true,
      };
    }

    // Create new OCR Job
    const job = await this.prisma.ocrJob.create({
      data: {
        attachmentId: dto.attachmentId,
        requestedById: user.id,
        status: OcrJobStatus.PROCESSING,
        engineName: this.ocrAdapter.engineName,
        engineVersion: this.ocrAdapter.engineVersion,
        languageHints: dto.languageHints || ['eng', 'hin'],
        targetType: dto.targetType,
        targetId: dto.targetId,
        startedAt: new Date(),
      },
    });

    // Execute OCR processing via pluggable adapter
    try {
      const result = await this.ocrAdapter.processDocument(
        attachment.fileName,
        attachment.mimeType,
        dto.languageHints,
      );

      const extraction = await this.prisma.ocrExtraction.create({
        data: {
          jobId: job.id,
          rawText: result.rawText,
          confidence: result.confidence,
          fields: result.fields as any,
        },
      });

      const completed = await this.prisma.ocrJob.update({
        where: { id: job.id },
        data: {
          status: OcrJobStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          extraction: true,
          attachment: { select: { id: true, fileName: true, mimeType: true, fileSize: true } },
        },
      });

      return { ...completed, deduplicated: false };
    } catch (err: any) {
      this.logger.error(`OCR processing failed for Job "${job.id}": ${err.message}`);
      const failed = await this.prisma.ocrJob.update({
        where: { id: job.id },
        data: {
          status: OcrJobStatus.FAILED,
          errorCode: 'OCR_PROCESSING_ERROR',
          errorMessage: err.message,
          completedAt: new Date(),
        },
        include: {
          attachment: { select: { id: true, fileName: true, mimeType: true, fileSize: true } },
        },
      });
      return { ...failed, deduplicated: false };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QUERY & DETAILS
  // ═══════════════════════════════════════════════════════════════════════════

  async getJobs(query: QueryOcrJobsDto, user: RequestUser): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OcrJobWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.attachmentId) where.attachmentId = query.attachmentId;
    if (query.targetType) where.targetType = query.targetType;

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.attachment = { companyId: dbUser?.companyId || 'invalid' };
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      where.OR = [
        { requestedById: user.id },
        { attachment: { mineId: { in: accessibleMineIds || [] } } },
      ];
    } else if (user.role !== UserRole.ADMIN && user.role !== UserRole.REGULATOR) {
      where.requestedById = user.id;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.ocrJob.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          attachment: { select: { id: true, fileName: true, mimeType: true, fileSize: true } },
          extraction: { select: { id: true, confidence: true, isLinked: true, reviewedAt: true } },
          requestedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.ocrJob.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getJob(id: string, user: RequestUser) {
    const job = await this.prisma.ocrJob.findUnique({
      where: { id },
      include: {
        attachment: true,
        extraction: true,
        requestedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!job) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `OCR Job "${id}" not found`,
      });
    }

    await this.assertAttachmentAccess(job.attachment, user);
    return job;
  }

  async getExtraction(id: string, user: RequestUser) {
    const job = await this.prisma.ocrJob.findUnique({
      where: { id },
      include: {
        attachment: true,
        extraction: {
          include: {
            reviewedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `OCR Job "${id}" not found`,
      });
    }

    await this.assertAttachmentAccess(job.attachment, user);

    if (!job.extraction) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `No extraction available for OCR Job "${id}" (status: ${job.status})`,
      });
    }

    return {
      jobId: job.id,
      status: job.status,
      targetType: job.targetType,
      targetId: job.targetId,
      extraction: job.extraction,
      disclaimer:
        'Digitized fields are machine-generated proposals. Human review and explicit confirmation are required prior to linking.',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. HUMAN REVIEW & CORRECTION FLOW
  // ═══════════════════════════════════════════════════════════════════════════

  async reviewExtraction(id: string, dto: ReviewOcrJobDto, user: RequestUser) {
    const job = await this.prisma.ocrJob.findUnique({
      where: { id },
      include: {
        attachment: true,
        extraction: true,
      },
    });

    if (!job) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `OCR Job "${id}" not found`,
      });
    }

    await this.assertAttachmentAccess(job.attachment, user);

    if (!job.extraction) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: `Cannot review an unextracted job (status: ${job.status})`,
      });
    }

    // Save human corrections and record reviewer ID without mutating authoritative legal compliance records
    const updatedExtraction = await this.prisma.ocrExtraction.update({
      where: { jobId: id },
      data: {
        correctedFields: dto.correctedFields as any,
        reviewedById: user.id,
        reviewedAt: new Date(),
        isLinked: !!dto.linkTarget,
      },
      include: {
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (dto.linkTarget) {
      await this.prisma.ocrJob.update({
        where: { id },
        data: {
          targetType: dto.linkTarget.type,
          targetId: dto.linkTarget.id,
        },
      });
    }

    return {
      jobId: id,
      reviewed: true,
      extraction: updatedExtraction,
      note: 'Human corrections saved and verified. Target link established without mutating statutory records.',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. RETRY FAILED JOB
  // ═══════════════════════════════════════════════════════════════════════════

  async retryJob(id: string, user: RequestUser) {
    const job = await this.prisma.ocrJob.findUnique({
      where: { id },
      include: { attachment: true },
    });

    if (!job) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `OCR Job "${id}" not found`,
      });
    }

    await this.assertAttachmentAccess(job.attachment, user);

    if (job.status !== OcrJobStatus.FAILED) {
      throw new BadRequestException({
        code: 'INVALID_STATE',
        message: `Only FAILED jobs can be retried (current status: ${job.status})`,
      });
    }

    // Mark as PROCESSING
    await this.prisma.ocrJob.update({
      where: { id },
      data: {
        status: OcrJobStatus.PROCESSING,
        errorCode: null,
        errorMessage: null,
        startedAt: new Date(),
      },
    });

    try {
      const result = await this.ocrAdapter.processDocument(
        job.attachment.fileName,
        job.attachment.mimeType,
        job.languageHints,
      );

      await this.prisma.ocrExtraction.upsert({
        where: { jobId: id },
        update: {
          rawText: result.rawText,
          confidence: result.confidence,
          fields: result.fields as any,
        },
        create: {
          jobId: id,
          rawText: result.rawText,
          confidence: result.confidence,
          fields: result.fields as any,
        },
      });

      return this.prisma.ocrJob.update({
        where: { id },
        data: {
          status: OcrJobStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          extraction: true,
          attachment: { select: { id: true, fileName: true, mimeType: true } },
        },
      });
    } catch (err: any) {
      return this.prisma.ocrJob.update({
        where: { id },
        data: {
          status: OcrJobStatus.FAILED,
          errorCode: 'OCR_PROCESSING_ERROR',
          errorMessage: err.message,
          completedAt: new Date(),
        },
      });
    }
  }
}
