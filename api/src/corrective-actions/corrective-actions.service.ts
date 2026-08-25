import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto } from './dto/update-capa.dto';
import { CloseCapaDto } from './dto/close-capa.dto';
import { QueryCapasDto } from './dto/query-capas.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CorrectiveAction, CapaStatus, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class CorrectiveActionsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Create and assign a Corrective Action for a statutory violation.
   */
  async create(
    violationId: string,
    dto: CreateCapaDto,
    user: RequestUser,
  ): Promise<CorrectiveAction> {
    const violation = await this.prisma.violation.findUnique({
      where: { id: violationId },
      include: { mine: true },
    });

    if (!violation) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Violation "${violationId}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, violation.mineId);

    // Verify assigned user exists, is active, and has authorization for this mine/company
    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assignedToId },
      include: { mineAssignments: { where: { active: true } } },
    });

    if (!assignee || assignee.status !== UserStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Assignee user "${dto.assignedToId}" not found or is not ACTIVE`,
      });
    }

    const hasAssigneeAccess = await this.scopeService.canAccessMine(
      assignee,
      violation.mineId,
    );

    if (!hasAssigneeAccess) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Assignee "${assignee.name}" does not have authorized scope for mine "${violation.mine.name}"`,
      });
    }

    return this.prisma.correctiveAction.create({
      data: {
        violationId,
        title: dto.title,
        description: dto.description,
        assignedToId: dto.assignedToId,
        assignedById: user.id,
        dueAt: new Date(dto.dueAt),
        status: CapaStatus.OPEN,
      },
      include: {
        violation: {
          select: { id: true, title: true, severity: true, mineId: true },
        },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  /**
   * Query paginated and filtered corrective actions.
   */
  async findAll(
    query: QueryCapasDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CorrectiveActionWhereInput = {};
    const violationWhere: Prisma.ViolationWhereInput = {};

    if (query.companyId) {
      violationWhere.mine = { companyId: query.companyId };
    }

    if (accessibleMineIds !== null) {
      if (query.mineId) {
        if (!accessibleMineIds.includes(query.mineId)) {
          return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
        }
        violationWhere.mineId = query.mineId;
        where.violation = violationWhere;
      } else if (query.assignedToId && query.assignedToId === user.id) {
        where.assignedToId = user.id;
        if (Object.keys(violationWhere).length > 0) {
          where.violation = violationWhere;
        }
      } else {
        where.OR = [
          { assignedToId: user.id },
          {
            violation: {
              ...violationWhere,
              mineId: { in: accessibleMineIds },
            },
          },
        ];
      }
    } else {
      if (query.mineId) {
        violationWhere.mineId = query.mineId;
      }
      if (Object.keys(violationWhere).length > 0) {
        where.violation = violationWhere;
      }
      if (query.assignedToId) {
        where.assignedToId = query.assignedToId;
      }
    }

    if (query.violationId) {
      where.violationId = query.violationId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dueBefore || query.dueAfter) {
      where.dueAt = {};
      if (query.dueBefore) where.dueAt.lte = new Date(query.dueBefore);
      if (query.dueAfter) where.dueAt.gte = new Date(query.dueAfter);
    }

    const [items, total] = await Promise.all([
      this.prisma.correctiveAction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { dueAt: 'asc' },
        include: {
          violation: {
            select: {
              id: true,
              title: true,
              severity: true,
              status: true,
              mineId: true,
              mine: { select: { id: true, name: true, code: true } },
            },
          },
          assignedTo: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.correctiveAction.count({ where }),
    ]);

    const now = new Date();
    const data = items.map((ca) => ({
      ...ca,
      isOverdue: ca.status !== CapaStatus.CLOSED && ca.dueAt < now,
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
   * Get single CAPA details.
   */
  async findOne(id: string, user: RequestUser): Promise<any> {
    const capa = await this.prisma.correctiveAction.findUnique({
      where: { id },
      include: {
        violation: {
          include: {
            mine: { select: { id: true, name: true, code: true } },
            observation: true,
            raisedBy: { select: { id: true, name: true, email: true } },
          },
        },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        assignedBy: { select: { id: true, name: true, email: true, role: true } },
        verifiedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!capa) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `CorrectiveAction "${id}" not found`,
      });
    }

    if (capa.assignedToId !== user.id) {
      await this.scopeService.assertMineAccess(user, capa.violation.mineId);
    }

    const isOverdue = capa.status !== CapaStatus.CLOSED && capa.dueAt < new Date();

    return {
      ...capa,
      isOverdue,
    };
  }

  /**
   * Update CAPA metadata (controlled edits).
   */
  async update(
    id: string,
    dto: UpdateCapaDto,
    user: RequestUser,
  ): Promise<CorrectiveAction> {
    const capa = await this.prisma.correctiveAction.findUnique({
      where: { id },
      include: { violation: true },
    });

    if (!capa) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `CorrectiveAction "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, capa.violation.mineId);

    const data: Prisma.CorrectiveActionUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueAt !== undefined) data.dueAt = new Date(dto.dueAt);

    if (dto.assignedToId !== undefined) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      });
      if (!assignee || assignee.status !== UserStatus.ACTIVE) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Assignee user "${dto.assignedToId}" not found or is not ACTIVE`,
        });
      }
      const hasAccess = await this.scopeService.canAccessMine(
        assignee,
        capa.violation.mineId,
      );
      if (!hasAccess) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `New assignee "${assignee.name}" does not have scope for this mine`,
        });
      }
      data.assignedTo = { connect: { id: dto.assignedToId } };
    }

    return this.prisma.correctiveAction.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Start working on a CAPA (OPEN -> IN_PROGRESS).
   */
  async start(id: string, user: RequestUser): Promise<CorrectiveAction> {
    const capa = await this.prisma.correctiveAction.findUnique({
      where: { id },
      include: { violation: true },
    });

    if (!capa) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `CorrectiveAction "${id}" not found`,
      });
    }

    if (capa.assignedToId !== user.id) {
      await this.scopeService.assertMineAccess(user, capa.violation.mineId);
    }

    if (capa.status !== CapaStatus.OPEN) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `CAPA must be in OPEN status to start. Current status: ${capa.status}`,
      });
    }

    return this.prisma.correctiveAction.update({
      where: { id },
      data: {
        status: CapaStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Close a CAPA with mandatory closure note.
   */
  async close(
    id: string,
    dto: CloseCapaDto,
    user: RequestUser,
  ): Promise<any> {
    const capa = await this.prisma.correctiveAction.findUnique({
      where: { id },
      include: { violation: { include: { correctiveActions: true } } },
    });

    if (!capa) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `CorrectiveAction "${id}" not found`,
      });
    }

    if (capa.assignedToId !== user.id) {
      await this.scopeService.assertMineAccess(user, capa.violation.mineId);
    }

    if (capa.status === CapaStatus.CLOSED) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'CAPA is already CLOSED',
      });
    }

    const updatedCapa = await this.prisma.correctiveAction.update({
      where: { id },
      data: {
        status: CapaStatus.CLOSED,
        closedAt: new Date(),
        closureNote: dto.closureNote,
        verifiedById: user.id,
        verifiedAt: new Date(),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        verifiedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Check if all actions under this violation are now CLOSED
    const siblingActions = capa.violation.correctiveActions.filter((a) => a.id !== id);
    const allClosed = siblingActions.every((a) => a.status === CapaStatus.CLOSED);

    return {
      data: updatedCapa,
      violationId: capa.violationId,
      allCorrectiveActionsClosed: allClosed,
    };
  }
}
