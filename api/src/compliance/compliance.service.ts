import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRequirementsDto } from './dto/query-requirements.dto';
import { QueryRecordsDto } from './dto/query-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { ComplianceRequirement, ComplianceRecord } from '@prisma/client';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async findAllRequirements(
    query: QueryRequirementsDto,
  ): Promise<PaginatedResponse<ComplianceRequirement>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.applicableTo) where.applicableTo = query.applicableTo;
    if (query.active !== undefined) where.active = query.active === 'true';

    const [data, total] = await Promise.all([
      this.prisma.complianceRequirement.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complianceRequirement.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findRecordsByMine(
    mineId: string,
    query: QueryRecordsDto,
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    // Verify mine exists
    const mine = await this.prisma.mine.findUnique({ where: { id: mineId } });
    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine with id "${mineId}" not found`,
      });
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { mineId };
    if (query.status) where.status = query.status;
    if (query.requirementId) where.requirementId = query.requirementId;

    const [data, total] = await Promise.all([
      this.prisma.complianceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { requirement: true, mine: true },
      }),
      this.prisma.complianceRecord.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateRecord(
    mineId: string,
    recordId: string,
    dto: UpdateRecordDto,
  ): Promise<ComplianceRecord> {
    // At least one field must be provided
    const hasUpdate =
      dto.status !== undefined ||
      dto.remarks !== undefined ||
      dto.lastCheckedAt !== undefined ||
      dto.nextDueAt !== undefined;

    if (!hasUpdate) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'At least one field must be provided for update',
      });
    }

    // Find the record and verify it belongs to the given mine
    const record = await this.prisma.complianceRecord.findUnique({
      where: { id: recordId },
    });

    if (!record || record.mineId !== mineId) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Compliance record "${recordId}" not found for mine "${mineId}"`,
      });
    }

    const data: Record<string, unknown> = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.remarks !== undefined) data.remarks = dto.remarks;
    if (dto.lastCheckedAt !== undefined) {
      data.lastCheckedAt = new Date(dto.lastCheckedAt);
    }
    if (dto.nextDueAt !== undefined) {
      data.nextDueAt = new Date(dto.nextDueAt);
    }

    // If status changes and lastCheckedAt not provided, default to now
    if (dto.status !== undefined && dto.lastCheckedAt === undefined) {
      data.lastCheckedAt = new Date();
    }

    return this.prisma.complianceRecord.update({
      where: { id: recordId },
      data,
      include: { requirement: true, mine: true },
    });
  }
}
