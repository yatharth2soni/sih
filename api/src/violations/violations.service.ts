import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { RaiseViolationDto } from './dto/raise-violation.dto';
import { QueryViolationsDto } from './dto/query-violations.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { EscalationService } from '../alerts/escalation.service';
import { NotificationSchedulerService } from '../alerts/notification-scheduler.service';
import { ALERT_RULES_CONFIG } from '../config/alert-rules.config';
import {
  Violation,
  ViolationStatus,
  CapaStatus,
  ComplianceStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class ViolationsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    @Optional() private escalationService?: EscalationService,
    @Optional() private schedulerService?: NotificationSchedulerService,
  ) {}

  /**
   * Formally raise a statutory violation from an observation in a single atomic transaction.
   */
  async raiseFromObservation(
    observationId: string,
    dto: RaiseViolationDto,
    user: RequestUser,
  ): Promise<any> {
    const observation = await this.prisma.observation.findUnique({
      where: { id: observationId },
      include: {
        inspection: true,
        violation: true,
      },
    });

    if (!observation) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Observation "${observationId}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, observation.inspection.mineId);

    // 409 Conflict if violation is already raised for this observation
    if (observation.violation) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Violation already exists for observation "${observationId}"`,
        details: { existingViolationId: observation.violation.id },
      });
    }

    const requirementId =
      dto.complianceRequirementId || observation.complianceRequirementId;
    let recordId = dto.complianceRecordId || observation.complianceRecordId;

    // If no explicit recordId provided, try to resolve from (mineId, requirementId)
    if (!recordId && requirementId) {
      const record = await this.prisma.complianceRecord.findUnique({
        where: {
          requirementId_mineId: {
            requirementId,
            mineId: observation.inspection.mineId,
          },
        },
      });
      if (record) {
        recordId = record.id;
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const violation = await tx.violation.create({
        data: {
          observationId,
          mineId: observation.inspection.mineId,
          title: dto.title || observation.title,
          description: dto.description || observation.description,
          severity: dto.severity || observation.severity,
          complianceRequirementId: requirementId,
          complianceRecordId: recordId,
          raisedById: user.id,
          status: ViolationStatus.OPEN,
        },
        include: {
          mine: { select: { id: true, name: true, code: true, companyId: true } },
          observation: true,
          complianceRequirement: { select: { id: true, title: true, category: true } },
          complianceRecord: true,
          raisedBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      let updatedRecord: any = null;
      if (dto.markComplianceRecordNonCompliant && recordId) {
        updatedRecord = await tx.complianceRecord.update({
          where: { id: recordId },
          data: {
            status: ComplianceStatus.NON_COMPLIANT,
            lastCheckedAt: new Date(),
            remarks: `Flagged NON_COMPLIANT via statutory violation: ${violation.title}`,
          },
        });
      }

      return {
        violation,
        complianceRecordUpdated: updatedRecord,
      };
    });

    // Domain Event trigger: deliver in-app notifications to stakeholders
    if (this.escalationService && this.schedulerService) {
      try {
        const mine = result.violation.mine;
        const recipients = await this.schedulerService.getRecipientsForViolationRaised(
          observation.inspection.mineId,
          mine.companyId,
        );
        const rule = ALERT_RULES_CONFIG.rules.VIOLATION_RAISED;
        for (const recipient of recipients) {
          await this.escalationService.recordAndDeliver({
            ruleKey: rule.ruleKey,
            resourceType: 'Violation',
            resourceId: result.violation.id,
            stage: rule.stage,
            recipientId: recipient.id,
            recipientRole: recipient.role,
            notificationPayload: {
              type: NotificationType.VIOLATION_RAISED,
              title: `${rule.titleTemplate}: ${result.violation.title}`,
              body: `Statutory violation raised at "${mine.name}" with severity ${result.violation.severity}.`,
              resourceType: 'Violation',
              resourceId: result.violation.id,
              severity: result.violation.severity,
              metadata: {
                violationId: result.violation.id,
                mineId: observation.inspection.mineId,
                raisedById: user.id,
              },
            },
          });
        }
      } catch (err) {
        // Non-fatal for violation creation
      }
    }

    return result;
  }

  /**
   * Query paginated and filtered violations.
   */
  async findAll(
    query: QueryViolationsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<Violation>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ViolationWhereInput = {};

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

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.requirementId) {
      where.complianceRequirementId = query.requirementId;
    }

    if (query.assignedToId) {
      where.correctiveActions = {
        some: { assignedToId: query.assignedToId },
      };
    }

    if (query.from || query.to) {
      where.raisedAt = {};
      if (query.from) where.raisedAt.gte = new Date(query.from);
      if (query.to) where.raisedAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.violation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { raisedAt: 'desc' },
        include: {
          mine: { select: { id: true, name: true, code: true, location: true } },
          complianceRequirement: { select: { id: true, title: true, category: true } },
          raisedBy: { select: { id: true, name: true, email: true, role: true } },
          correctiveActions: {
            select: {
              id: true,
              title: true,
              status: true,
              dueAt: true,
              assignedTo: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.violation.count({ where }),
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

  /**
   * Get full details of a violation with source observation and CAPAs.
   */
  async findOne(id: string, user: RequestUser): Promise<Violation> {
    const violation = await this.prisma.violation.findUnique({
      where: { id },
      include: {
        mine: {
          select: {
            id: true,
            name: true,
            code: true,
            company: { select: { id: true, name: true, code: true } },
          },
        },
        observation: {
          include: {
            inspection: {
              select: {
                id: true,
                status: true,
                scheduledFor: true,
                conductedBy: { select: { id: true, name: true, email: true } },
              },
            },
            recordedBy: { select: { id: true, name: true, email: true } },
          },
        },
        complianceRequirement: true,
        complianceRecord: true,
        raisedBy: { select: { id: true, name: true, email: true, role: true } },
        correctiveActions: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true, email: true } },
            verifiedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!violation) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Violation "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, violation.mineId);

    return violation;
  }

  /**
   * Update violation review status, waive, or resolve.
   */
  async update(
    id: string,
    dto: UpdateViolationDto,
    user: RequestUser,
  ): Promise<Violation> {
    const violation = await this.prisma.violation.findUnique({
      where: { id },
      include: { correctiveActions: true },
    });

    if (!violation) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Violation "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, violation.mineId);

    // Business rule: Cannot mark violation RESOLVED if any CAPAs remain open or in-progress
    if (dto.status === ViolationStatus.RESOLVED) {
      const openActions = violation.correctiveActions.filter(
        (ca) => ca.status !== CapaStatus.CLOSED,
      );
      if (openActions.length > 0) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Cannot resolve violation with ${openActions.length} open/in-progress corrective action(s). All CAPAs must be CLOSED first.`,
        });
      }
    }

    const data: Prisma.ViolationUpdateInput = {};
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === ViolationStatus.RESOLVED) {
        data.resolvedAt = new Date();
      }
    }
    if (dto.resolutionNote !== undefined) {
      data.resolutionNote = dto.resolutionNote;
    }

    return this.prisma.violation.update({
      where: { id },
      data,
      include: {
        mine: { select: { id: true, name: true, code: true } },
        correctiveActions: true,
      },
    });
  }
}
