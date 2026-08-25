import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { QueryEscalationsDto } from './dto/query-escalations.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  EscalationLog,
  EscalationOutcome,
  Notification,
  Prisma,
} from '@prisma/client';

export interface RecordAndDeliverParams {
  ruleKey: string;
  resourceType: string;
  resourceId: string;
  stage: number;
  recipientId: string;
  recipientRole?: string;
  notificationPayload: Omit<CreateNotificationDto, 'recipientId'>;
  detail?: Record<string, any>;
  occurredAt?: Date;
}

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Safe delivery with strict idempotency via EscalationLog unique key.
   */
  async recordAndDeliver(
    params: RecordAndDeliverParams,
  ): Promise<{
    outcome: EscalationOutcome;
    log?: EscalationLog;
    notification?: Notification;
  }> {
    const {
      ruleKey,
      resourceType,
      resourceId,
      stage,
      recipientId,
      recipientRole,
      notificationPayload,
      detail,
      occurredAt = new Date(),
    } = params;

    const idempotencyKey = `${ruleKey}:${resourceId}:${stage}:${recipientId}`;

    // 1. Check idempotency log
    const existingLog = await this.prisma.escalationLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingLog) {
      this.logger.debug(
        `[Idempotent Skip] ${idempotencyKey} already executed at ${existingLog.occurredAt.toISOString()}`,
      );
      return { outcome: EscalationOutcome.SKIPPED, log: existingLog };
    }

    try {
      // 2. Deliver notification in-app
      const notification = await this.notificationsService.createNotification({
        ...notificationPayload,
        recipientId,
      });

      // 3. Persist escalation log
      const log = await this.prisma.escalationLog.create({
        data: {
          ruleKey,
          resourceType,
          resourceId,
          stage,
          recipientId,
          recipientRole,
          occurredAt,
          notificationId: notification.id,
          idempotencyKey,
          outcome: EscalationOutcome.SENT,
          detail: (detail as Prisma.InputJsonValue) || Prisma.JsonNull,
        },
      });

      return { outcome: EscalationOutcome.SENT, log, notification };
    } catch (err: any) {
      this.logger.error(
        `Failed to record and deliver escalation ${idempotencyKey}: ${err.message}`,
        err.stack,
      );

      // Log failure in escalation log so it can be audited
      try {
        const failLog = await this.prisma.escalationLog.upsert({
          where: { idempotencyKey },
          update: { outcome: EscalationOutcome.FAILED },
          create: {
            ruleKey,
            resourceType,
            resourceId,
            stage,
            recipientId,
            recipientRole,
            occurredAt,
            idempotencyKey,
            outcome: EscalationOutcome.FAILED,
            detail: { error: err.message },
          },
        });
        return { outcome: EscalationOutcome.FAILED, log: failLog };
      } catch (logErr: any) {
        this.logger.error(`Could not write failure log: ${logErr.message}`);
        return { outcome: EscalationOutcome.FAILED };
      }
    }
  }

  /**
   * Query escalation audit log entries.
   */
  async queryEscalations(
    query: QueryEscalationsDto,
  ): Promise<PaginatedResponse<EscalationLog>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EscalationLogWhereInput = {};

    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.ruleKey) where.ruleKey = query.ruleKey;
    if (query.stage) where.stage = query.stage;
    if (query.outcome) where.outcome = query.outcome;

    if (query.from || query.to) {
      where.occurredAt = {};
      if (query.from) where.occurredAt.gte = new Date(query.from);
      if (query.to) where.occurredAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.escalationLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.escalationLog.count({ where }),
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
}
