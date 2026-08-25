import {
  Injectable,
  Optional,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { AuditService } from '../audit/audit.service';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { QueryGrievancesDto } from './dto/query-grievances.dto';
import { CreateGrievanceCommentDto } from './dto/create-comment.dto';
import { AssignGrievanceDto } from './dto/assign-grievance.dto';
import { EscalateGrievanceDto } from './dto/escalate-grievance.dto';
import {
  ResolveGrievanceDto,
  ReopenGrievanceDto,
  CloseGrievanceDto,
} from './dto/resolve-grievance.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  GrievancePriority,
  GrievanceStatus,
  CommentVisibility,
  UserRole,
  Prisma,
} from '@prisma/client';

export const SLA_HOURS: Record<GrievancePriority, number> = {
  [GrievancePriority.URGENT]: 24,   // 1 day
  [GrievancePriority.HIGH]: 72,     // 3 days
  [GrievancePriority.MEDIUM]: 168,  // 7 days
  [GrievancePriority.LOW]: 336,     // 14 days
};

@Injectable()
export class GrievancesService {
  private readonly logger = new Logger(GrievancesService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    @Optional() private auditService?: AuditService,
  ) {}

  /**
   * Checks whether the given user has handler permissions for the specified grievance.
   */
  private async isHandler(grievance: any, user: RequestUser): Promise<boolean> {
    // If the user is the reporter of this grievance, they are the complainant (cannot view handler-only notes or self-triage)
    if (user.id === grievance.reporterId && user.role !== UserRole.ADMIN) {
      return false;
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      return true;
    }
    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      return dbUser?.companyId === grievance.companyId;
    }
    if (user.role === UserRole.MINE_OFFICIAL && grievance.mineId) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { mineAssignments: { where: { active: true } } },
      });
      if (!dbUser) return false;
      const isDirectlyAssigned = dbUser.mineAssignments.some((a) => a.mineId === grievance.mineId);
      if (isDirectlyAssigned) return true;
      if (dbUser.mineAssignments.length === 0 && dbUser.companyId) {
        return dbUser.companyId === grievance.companyId;
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. INTAKE & CREATION
  // ═══════════════════════════════════════════════════════════════════════════

  async createGrievance(dto: CreateGrievanceDto, user: RequestUser) {
    let companyId: string;

    if (dto.mineId) {
      const mine = await this.prisma.mine.findUnique({
        where: { id: dto.mineId },
      });
      if (!mine) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Mine "${dto.mineId}" not found`,
        });
      }
      companyId = mine.companyId;

      if (user.role === UserRole.CORPORATE || user.role === UserRole.MINE_OFFICIAL) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { companyId: true },
        });
        if (dbUser?.companyId && dbUser.companyId !== companyId) {
          throw new ForbiddenException({
            code: 'FORBIDDEN',
            message: 'You cannot file grievances for another company mine',
          });
        }
      }
    } else {
      // Company-level grievance
      if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
        if (!dto.companyId) {
          throw new UnprocessableEntityException({
            code: 'VALIDATION_ERROR',
            message: 'companyId is required for company-level grievances filed by admin/regulator',
          });
        }
        companyId = dto.companyId;
      } else {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { companyId: true },
        });
        if (!dbUser?.companyId) {
          throw new ForbiddenException({
            code: 'FORBIDDEN',
            message: 'User is not associated with any company',
          });
        }
        companyId = dbUser.companyId;
      }
    }

    const priority = dto.priority || GrievancePriority.MEDIUM;
    const slaHours = SLA_HOURS[priority] || 168;
    const now = new Date();
    const slaDueAt = new Date(now.getTime() + slaHours * 3600 * 1000);

    const grievance = await this.prisma.grievance.create({
      data: {
        reporterId: user.id,
        companyId,
        mineId: dto.mineId,
        subject: dto.subject,
        description: dto.description,
        category: dto.category,
        priority,
        status: GrievanceStatus.OPEN,
        slaDueAt,
      },
      include: {
        company: { select: { id: true, name: true, code: true } },
        mine: { select: { id: true, name: true, code: true } },
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Record initial status history
    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: grievance.id,
        actorId: user.id,
        fromStatus: GrievanceStatus.OPEN,
        toStatus: GrievanceStatus.OPEN,
        reason: 'Grievance submitted by reporter',
      },
    });

    return grievance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QUERY & SCOPED DETAIL
  // ═══════════════════════════════════════════════════════════════════════════

  async getGrievances(
    query: QueryGrievancesDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GrievanceWhereInput = {};

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      where.OR = [
        { reporterId: user.id },
        { mineId: { in: accessibleMineIds || [] } },
      ];
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      if (query.companyId) where.companyId = query.companyId;
    } else {
      // Regular user / reporter: strictly own grievances
      where.reporterId = user.id;
    }

    if (query.mineId) {
      if (user.role === UserRole.MINE_OFFICIAL) {
        await this.scopeService.assertMineAccess(user, query.mineId);
      }
      where.mineId = query.mineId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.reporterId) where.reporterId = query.reporterId;
    if (query.assignedToId) where.assignedToId = query.assignedToId;

    if (query.dueBefore) {
      where.slaDueAt = { lte: new Date(query.dueBefore) };
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [grievances, total] = await Promise.all([
      this.prisma.grievance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          company: { select: { id: true, name: true, code: true } },
          mine: { select: { id: true, name: true, code: true } },
          reporter: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.grievance.count({ where }),
    ]);

    return {
      data: grievances,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getGrievance(id: string, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true } },
        mine: { select: { id: true, name: true, code: true } },
        reporter: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    if (!grievance) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Grievance "${id}" not found`,
      });
    }

    const handler = await this.isHandler(grievance, user);
    const isReporter = grievance.reporterId === user.id;

    if (!handler && !isReporter) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this grievance',
      });
    }

    // Confidentiality filter: if not a handler, strip out HANDLERS_ONLY comments
    let filteredComments = grievance.comments;
    if (!handler) {
      filteredComments = grievance.comments.filter(
        (c) => c.visibility === CommentVisibility.REPORTER_AND_HANDLERS,
      );
    }

    return {
      ...grievance,
      comments: filteredComments,
      isOverdue: grievance.status !== GrievanceStatus.RESOLVED && grievance.status !== GrievanceStatus.CLOSED && grievance.slaDueAt < new Date(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COMMENTS & ASSIGNMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async addComment(
    id: string,
    dto: CreateGrievanceCommentDto,
    user: RequestUser,
  ) {
    const grievance = await this.prisma.grievance.findUnique({
      where: { id },
    });

    if (!grievance) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Grievance "${id}" not found`,
      });
    }

    const handler = await this.isHandler(grievance, user);
    const isReporter = grievance.reporterId === user.id;

    if (!handler && !isReporter) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have permission to comment on this grievance',
      });
    }

    let visibility = dto.visibility || CommentVisibility.REPORTER_AND_HANDLERS;
    // Reporters cannot create HANDLERS_ONLY notes
    if (!handler) {
      visibility = CommentVisibility.REPORTER_AND_HANDLERS;
    }

    return this.prisma.grievanceComment.create({
      data: {
        grievanceId: id,
        authorId: user.id,
        body: dto.body,
        visibility,
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async assignGrievance(
    id: string,
    dto: AssignGrievanceDto,
    user: RequestUser,
  ) {
    const grievance = await this.prisma.grievance.findUnique({
      where: { id },
    });

    if (!grievance) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Grievance "${id}" not found`,
      });
    }

    const handler = await this.isHandler(grievance, user);
    if (!handler) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only authorized handlers can assign grievances',
      });
    }

    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assignedToId },
    });

    if (!assignee) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `User "${dto.assignedToId}" not found`,
      });
    }

    if (assignee.companyId && assignee.companyId !== grievance.companyId) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Cannot assign grievance to a user from another company',
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId,
        acknowledgedAt: grievance.acknowledgedAt || new Date(),
        status: grievance.status === GrievanceStatus.OPEN ? GrievanceStatus.IN_PROGRESS : grievance.status,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: grievance.status,
        toStatus: updated.status,
        reason: `Assigned to ${assignee.name}`,
      },
    });

    return updated;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EXPLICIT STATUS LIFECYCLE TRANSITIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async startTriage(id: string, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException({ code: 'NOT_FOUND', message: `Grievance "${id}" not found` });

    if (!(await this.isHandler(grievance, user))) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only authorized handlers can start triage' });
    }

    if (grievance.status !== GrievanceStatus.OPEN && grievance.status !== GrievanceStatus.ESCALATED) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot start triage on grievance in "${grievance.status}" status (expected OPEN or ESCALATED)`,
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: {
        status: GrievanceStatus.IN_PROGRESS,
        acknowledgedAt: grievance.acknowledgedAt || new Date(),
      },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: grievance.status,
        toStatus: GrievanceStatus.IN_PROGRESS,
        reason: 'Triage started',
      },
    });

    return updated;
  }

  async escalateGrievance(id: string, dto: EscalateGrievanceDto, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException({ code: 'NOT_FOUND', message: `Grievance "${id}" not found` });

    if (!(await this.isHandler(grievance, user))) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only authorized handlers can escalate grievances' });
    }

    if (grievance.status !== GrievanceStatus.OPEN && grievance.status !== GrievanceStatus.IN_PROGRESS) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot escalate grievance in "${grievance.status}" status (expected OPEN or IN_PROGRESS)`,
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: { status: GrievanceStatus.ESCALATED },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: grievance.status,
        toStatus: GrievanceStatus.ESCALATED,
        reason: dto.reason,
      },
    });

    if (this.auditService) {
      await this.auditService.appendEntry({
        action: 'GRIEVANCE_ESCALATED',
        entityType: 'Grievance',
        entityId: id,
        actorId: user.id,
        companyId: grievance.companyId,
        mineId: grievance.mineId,
        beforeSummary: { status: grievance.status },
        afterSummary: { status: GrievanceStatus.ESCALATED, reason: dto.reason },
      });
    }

    return updated;
  }

  async resolveGrievance(id: string, dto: ResolveGrievanceDto, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException({ code: 'NOT_FOUND', message: `Grievance "${id}" not found` });

    if (!(await this.isHandler(grievance, user))) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only authorized handlers can resolve grievances' });
    }

    if (grievance.status !== GrievanceStatus.IN_PROGRESS && grievance.status !== GrievanceStatus.ESCALATED) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot resolve grievance in "${grievance.status}" status (expected IN_PROGRESS or ESCALATED)`,
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: {
        status: GrievanceStatus.RESOLVED,
        resolvedAt: new Date(),
        resolutionNote: dto.resolutionNote,
      },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: grievance.status,
        toStatus: GrievanceStatus.RESOLVED,
        reason: dto.resolutionNote,
      },
    });

    if (this.auditService) {
      await this.auditService.appendEntry({
        action: 'GRIEVANCE_RESOLVED',
        entityType: 'Grievance',
        entityId: id,
        actorId: user.id,
        companyId: grievance.companyId,
        mineId: grievance.mineId,
        beforeSummary: { status: grievance.status },
        afterSummary: { status: GrievanceStatus.RESOLVED, resolutionNote: dto.resolutionNote },
      });
    }

    return updated;
  }

  async closeGrievance(id: string, dto: CloseGrievanceDto, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException({ code: 'NOT_FOUND', message: `Grievance "${id}" not found` });

    if (!(await this.isHandler(grievance, user))) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only authorized handlers can close grievances' });
    }

    if (grievance.status !== GrievanceStatus.RESOLVED) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot close grievance in "${grievance.status}" status (must be RESOLVED first)`,
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: {
        status: GrievanceStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: grievance.status,
        toStatus: GrievanceStatus.CLOSED,
        reason: dto.note || 'Grievance closed after verification',
      },
    });

    return updated;
  }

  async reopenGrievance(id: string, dto: ReopenGrievanceDto, user: RequestUser) {
    const grievance = await this.prisma.grievance.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException({ code: 'NOT_FOUND', message: `Grievance "${id}" not found` });

    const handler = await this.isHandler(grievance, user);
    const isReporter = grievance.reporterId === user.id;

    if (!handler && !isReporter) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You do not have permission to reopen this grievance' });
    }

    if (grievance.status !== GrievanceStatus.RESOLVED) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Cannot reopen grievance in "${grievance.status}" status (expected RESOLVED)`,
      });
    }

    const updated = await this.prisma.grievance.update({
      where: { id },
      data: {
        status: GrievanceStatus.IN_PROGRESS,
        resolvedAt: null,
      },
    });

    await this.prisma.grievanceStatusHistory.create({
      data: {
        grievanceId: id,
        actorId: user.id,
        fromStatus: GrievanceStatus.RESOLVED,
        toStatus: GrievanceStatus.IN_PROGRESS,
        reason: `Reopened: ${dto.reason}`,
      },
    });

    return updated;
  }
}
