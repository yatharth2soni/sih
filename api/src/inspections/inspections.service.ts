import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { QueryInspectionsDto } from './dto/query-inspections.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { Inspection, InspectionStatus, Prisma } from '@prisma/client';

@Injectable()
export class InspectionsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Schedule a new mine inspection.
   */
  async schedule(dto: ScheduleInspectionDto, user: RequestUser): Promise<Inspection> {
    await this.scopeService.assertMineAccess(user, dto.mineId);

    if (dto.templateId) {
      const template = await this.prisma.inspectionTemplate.findUnique({
        where: { id: dto.templateId },
      });
      if (!template || !template.isActive) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Active inspection template "${dto.templateId}" not found`,
        });
      }
    }

    return this.prisma.inspection.create({
      data: {
        mineId: dto.mineId,
        templateId: dto.templateId,
        scheduledFor: new Date(dto.scheduledFor),
        purpose: dto.purpose,
        status: InspectionStatus.SCHEDULED,
        createdById: user.id,
      },
      include: {
        mine: { select: { id: true, name: true, code: true, location: true } },
        template: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  /**
   * Get paginated and filtered inspections accessible to the user.
   */
  async findAll(
    query: QueryInspectionsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InspectionWhereInput = {};

    if (accessibleMineIds !== null) {
      if (query.mineId) {
        if (!accessibleMineIds.includes(query.mineId)) {
          return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
        }
        where.mineId = query.mineId;
      } else {
        where.mineId = { in: accessibleMineIds };
      }
    } else if (query.mineId) {
      where.mineId = query.mineId;
    }

    if (query.companyId) {
      where.mine = { companyId: query.companyId };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.conductedById) {
      where.conductedById = query.conductedById;
    }

    if (query.templateId) {
      where.templateId = query.templateId;
    }

    if (query.from || query.to) {
      where.scheduledFor = {};
      if (query.from) where.scheduledFor.gte = new Date(query.from);
      if (query.to) where.scheduledFor.lte = new Date(query.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { scheduledFor: 'desc' },
        include: {
          mine: { select: { id: true, name: true, code: true, location: true } },
          template: { select: { id: true, name: true, category: true } },
          conductedBy: { select: { id: true, name: true, email: true, role: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          _count: {
            select: {
              observations: true,
            },
          },
        },
      }),
      this.prisma.inspection.count({ where }),
    ]);

    // Attach finding count metrics
    const data = items.map((item) => ({
      ...item,
      findingCount: item._count.observations,
    }));

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

  /**
   * Get full details of a specific inspection with observations and violations.
   */
  async findOne(id: string, user: RequestUser): Promise<any> {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        mine: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true,
            companyId: true,
            company: { select: { id: true, name: true, code: true } },
          },
        },
        template: true,
        conductedBy: { select: { id: true, name: true, email: true, role: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        observations: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            complianceRequirement: { select: { id: true, title: true, category: true } },
            complianceRecord: { select: { id: true, status: true, remarks: true } },
            recordedBy: { select: { id: true, name: true, email: true, role: true } },
            violation: {
              include: {
                correctiveActions: {
                  include: {
                    assignedTo: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Inspection "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, inspection.mineId);

    const violationsCount = inspection.observations.filter((o) => !!o.violation).length;
    const totalCapas = inspection.observations.reduce(
      (sum, o) => sum + (o.violation?.correctiveActions.length || 0),
      0,
    );

    return {
      data: inspection,
      metrics: {
        totalObservations: inspection.observations.length,
        violationsCount,
        correctiveActionsCount: totalCapas,
      },
    };
  }

  /**
   * Reschedule or update scheduled metadata (only when SCHEDULED).
   */
  async update(id: string, dto: UpdateInspectionDto, user: RequestUser): Promise<Inspection> {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } });
    if (!inspection) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Inspection "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, inspection.mineId);

    if (inspection.status !== InspectionStatus.SCHEDULED) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Only SCHEDULED inspections can be modified. Current status: ${inspection.status}`,
      });
    }

    const data: Prisma.InspectionUpdateInput = {};
    if (dto.scheduledFor) data.scheduledFor = new Date(dto.scheduledFor);
    if (dto.purpose !== undefined) data.purpose = dto.purpose;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.status !== undefined) {
      if (
        dto.status !== InspectionStatus.SCHEDULED &&
        dto.status !== InspectionStatus.CANCELLED
      ) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Cannot transition directly to ${dto.status} via patch. Use start/complete endpoints.`,
        });
      }
      data.status = dto.status;
    }

    return this.prisma.inspection.update({
      where: { id },
      data,
      include: {
        mine: { select: { id: true, name: true, code: true } },
        conductedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Start an inspection (SCHEDULED -> IN_PROGRESS).
   */
  async start(id: string, user: RequestUser): Promise<Inspection> {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } });
    if (!inspection) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Inspection "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, inspection.mineId);

    if (inspection.status !== InspectionStatus.SCHEDULED) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Inspection must be in SCHEDULED status to start. Current status: ${inspection.status}`,
      });
    }

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: InspectionStatus.IN_PROGRESS,
        startedAt: new Date(),
        conductedById: inspection.conductedById || user.id,
      },
      include: {
        mine: { select: { id: true, name: true, code: true } },
        conductedBy: { select: { id: true, name: true, email: true, role: true } },
        template: true,
      },
    });
  }

  /**
   * Complete an inspection (IN_PROGRESS -> COMPLETED).
   */
  async complete(
    id: string,
    user: RequestUser,
    summary?: string,
  ): Promise<any> {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        _count: { select: { observations: true } },
        observations: {
          select: {
            id: true,
            severity: true,
            findingType: true,
            violation: { select: { id: true, status: true } },
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Inspection "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, inspection.mineId);

    if (inspection.status !== InspectionStatus.IN_PROGRESS) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Inspection must be in IN_PROGRESS status to complete. Current status: ${inspection.status}`,
      });
    }

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: InspectionStatus.COMPLETED,
        completedAt: new Date(),
        summary: summary || inspection.summary,
      },
      include: {
        mine: { select: { id: true, name: true, code: true } },
        conductedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const violationsCount = inspection.observations.filter((o) => !!o.violation).length;

    return {
      data: updated,
      summary: {
        totalObservations: inspection.observations.length,
        violationsRaised: violationsCount,
        completedAt: updated.completedAt,
      },
    };
  }

  /**
   * Create an inspection checklist template.
   */
  async createTemplate(dto: CreateTemplateDto, user: RequestUser) {
    if (dto.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: dto.companyId } });
      if (!company) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Company "${dto.companyId}" not found`,
        });
      }
    }

    return this.prisma.inspectionTemplate.create({
      data: {
        name: dto.name,
        companyId: dto.companyId,
        category: dto.category,
        description: dto.description,
        checklist: dto.checklist as unknown as Prisma.InputJsonValue,
        createdById: user.id,
      },
      include: {
        company: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Get active templates.
   */
  async getTemplates(companyId?: string) {
    const where: Prisma.InspectionTemplateWhereInput = { isActive: true };
    if (companyId) {
      where.OR = [{ companyId }, { companyId: null }];
    }

    return this.prisma.inspectionTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { company: { select: { id: true, name: true, code: true } } },
    });
  }
}
