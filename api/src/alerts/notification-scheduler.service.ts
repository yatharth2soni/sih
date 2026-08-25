import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EscalationService } from './escalation.service';
import { ALERT_RULES_CONFIG } from '../config/alert-rules.config';
import {
  ComplianceStatus,
  CapaStatus,
  UserRole,
  UserStatus,
  NotificationType,
} from '@prisma/client';

export interface ScanSummary {
  scannedAt: Date;
  complianceRecordsScanned: number;
  complianceRemindersSent: number;
  correctiveActionsScanned: number;
  capaEscalationsSent: number;
  skippedIdempotent: number;
  failedCount: number;
}

@Injectable()
export class NotificationSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isScanning = false;

  constructor(
    private prisma: PrismaService,
    private escalationService: EscalationService,
  ) {}

  onModuleInit() {
    // Schedule periodic scan every 5 minutes in production / background
    const intervalMs = parseInt(process.env.SCAN_INTERVAL_MS || '300000', 10);
    this.timer = setInterval(() => {
      this.runPeriodicScan().catch((err) => {
        this.logger.error(`Periodic notification scan error: ${err.message}`, err.stack);
      });
    }, intervalMs);
    this.logger.log(`NotificationSchedulerService initialized (interval: ${intervalMs}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Safe periodic background job wrapper.
   */
  async runPeriodicScan(): Promise<void> {
    if (this.isScanning) {
      this.logger.warn('Scan already in progress, skipping tick.');
      return;
    }
    this.isScanning = true;
    try {
      const summary = await this.scanAndEscalate();
      this.logger.log(
        `[Scan Complete] Reminders: ${summary.complianceRemindersSent}, CAPA Escalations: ${summary.capaEscalationsSent}, Skipped: ${summary.skippedIdempotent}`,
      );
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Main scan routine with injectable clock for deterministic testing.
   */
  async scanAndEscalate(nowDate: Date = new Date()): Promise<ScanSummary> {
    const summary: ScanSummary = {
      scannedAt: nowDate,
      complianceRecordsScanned: 0,
      complianceRemindersSent: 0,
      correctiveActionsScanned: 0,
      capaEscalationsSent: 0,
      skippedIdempotent: 0,
      failedCount: 0,
    };

    await this.scanComplianceRecords(nowDate, summary);
    await this.scanCorrectiveActions(nowDate, summary);

    return summary;
  }

  /**
   * 1. Scan Compliance Records for Due Reminders and Overdue Escalations
   */
  private async scanComplianceRecords(now: Date, summary: ScanSummary): Promise<void> {
    const records = await this.prisma.complianceRecord.findMany({
      where: {
        nextDueAt: { not: null },
      },
      include: {
        requirement: true,
        mine: {
          include: {
            company: true,
          },
        },
      },
    });

    summary.complianceRecordsScanned = records.length;

    for (const record of records) {
      if (!record.nextDueAt) continue;

      try {
        const diffMs = record.nextDueAt.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // Stage 3: Overdue (nextDueAt < now and status != COMPLIANT)
        if (diffDays < 0 && record.status !== ComplianceStatus.COMPLIANT) {
          const rule = ALERT_RULES_CONFIG.rules.COMPLIANCE_OVERDUE;
          const recipients = await this.getRecipientsForComplianceOverdue(record);

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'ComplianceRecord',
              resourceId: record.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.COMPLIANCE_OVERDUE,
                title: `${rule.titleTemplate}: ${record.requirement.title}`,
                body: `Statutory compliance record for "${record.mine.name}" was due on ${record.nextDueAt.toISOString().split('T')[0]}. Immediate action required.`,
                resourceType: 'ComplianceRecord',
                resourceId: record.id,
                severity: rule.severity,
                metadata: {
                  mineId: record.mineId,
                  mineName: record.mine.name,
                  requirementId: record.requirementId,
                  nextDueAt: record.nextDueAt,
                  status: record.status,
                },
              },
            });

            if (res.outcome === 'SENT') summary.complianceRemindersSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
        // Stage 2: Due in <= 7 days (and > 0 days)
        else if (diffDays <= 7 && diffDays > 0) {
          const rule = ALERT_RULES_CONFIG.rules.COMPLIANCE_DUE_7D;
          const recipients = await this.getRecipientsForCompliance7Days(record);

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'ComplianceRecord',
              resourceId: record.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.COMPLIANCE_DUE,
                title: `${rule.titleTemplate}: ${record.requirement.title}`,
                body: `Statutory requirement for "${record.mine.name}" is due in ${Math.ceil(diffDays)} day(s) on ${record.nextDueAt.toISOString().split('T')[0]}.`,
                resourceType: 'ComplianceRecord',
                resourceId: record.id,
                severity: rule.severity,
                metadata: {
                  mineId: record.mineId,
                  mineName: record.mine.name,
                  requirementId: record.requirementId,
                  nextDueAt: record.nextDueAt,
                },
              },
            });

            if (res.outcome === 'SENT') summary.complianceRemindersSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
        // Stage 1: Due in <= 14 days (and > 7 days)
        else if (diffDays <= 14 && diffDays > 7) {
          const rule = ALERT_RULES_CONFIG.rules.COMPLIANCE_DUE_14D;
          const recipients = await this.getRecipientsForMine(record.mineId, record.mine.companyId);

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'ComplianceRecord',
              resourceId: record.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.COMPLIANCE_DUE,
                title: `${rule.titleTemplate}: ${record.requirement.title}`,
                body: `Statutory requirement for "${record.mine.name}" is due in ${Math.ceil(diffDays)} days on ${record.nextDueAt.toISOString().split('T')[0]}.`,
                resourceType: 'ComplianceRecord',
                resourceId: record.id,
                severity: rule.severity,
                metadata: {
                  mineId: record.mineId,
                  mineName: record.mine.name,
                  requirementId: record.requirementId,
                  nextDueAt: record.nextDueAt,
                },
              },
            });

            if (res.outcome === 'SENT') summary.complianceRemindersSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
      } catch (err: any) {
        this.logger.error(`Error processing ComplianceRecord "${record.id}": ${err.message}`);
        summary.failedCount++;
      }
    }
  }

  /**
   * 2. Scan Corrective Actions for Due Reminders and Multi-stage Overdue Escalations
   */
  private async scanCorrectiveActions(now: Date, summary: ScanSummary): Promise<void> {
    const capas = await this.prisma.correctiveAction.findMany({
      where: {
        status: { not: CapaStatus.CLOSED },
      },
      include: {
        assignedTo: true,
        assignedBy: true,
        violation: {
          include: {
            mine: {
              include: { company: true },
            },
          },
        },
      },
    });

    summary.correctiveActionsScanned = capas.length;

    for (const capa of capas) {
      try {
        const diffMs = capa.dueAt.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // Stage 2 Overdue: Overdue by 3+ days (diffDays <= -3)
        if (diffDays <= -3) {
          const rule = ALERT_RULES_CONFIG.rules.CAPA_OVERDUE_STAGE_2;
          const recipients = await this.getRecipientsForCapaStage2Overdue(capa);

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'CorrectiveAction',
              resourceId: capa.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.CAPA_OVERDUE,
                title: `${rule.titleTemplate}: ${capa.title}`,
                body: `Corrective Action for mine "${capa.violation.mine.name}" is ${Math.abs(Math.floor(diffDays))} days overdue! Assigned to ${capa.assignedTo.name}.`,
                resourceType: 'CorrectiveAction',
                resourceId: capa.id,
                severity: rule.severity,
                metadata: {
                  capaId: capa.id,
                  violationId: capa.violationId,
                  mineId: capa.violation.mineId,
                  assignedToId: capa.assignedToId,
                  dueAt: capa.dueAt,
                  daysOverdue: Math.abs(Math.floor(diffDays)),
                },
              },
            });

            if (res.outcome === 'SENT') summary.capaEscalationsSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
        // Stage 1 Overdue: Overdue by 0 to 3 days (-3 < diffDays < 0)
        else if (diffDays < 0) {
          const rule = ALERT_RULES_CONFIG.rules.CAPA_OVERDUE_STAGE_1;
          const recipients = await this.getRecipientsForCapaStage1Overdue(capa);

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'CorrectiveAction',
              resourceId: capa.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.CAPA_OVERDUE,
                title: `${rule.titleTemplate}: ${capa.title}`,
                body: `Corrective Action deadline (${capa.dueAt.toISOString().split('T')[0]}) has passed. Immediate resolution required.`,
                resourceType: 'CorrectiveAction',
                resourceId: capa.id,
                severity: rule.severity,
                metadata: {
                  capaId: capa.id,
                  violationId: capa.violationId,
                  mineId: capa.violation.mineId,
                  assignedToId: capa.assignedToId,
                  dueAt: capa.dueAt,
                },
              },
            });

            if (res.outcome === 'SENT') summary.capaEscalationsSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
        // Stage 2 Due: Due in <= 1 day (> 0 days)
        else if (diffDays <= 1 && diffDays > 0) {
          const rule = ALERT_RULES_CONFIG.rules.CAPA_DUE_1D;
          const recipients = [capa.assignedTo, capa.assignedBy].filter(
            (u, idx, arr) => arr.findIndex((x) => x.id === u.id) === idx,
          );

          for (const recipient of recipients) {
            const res = await this.escalationService.recordAndDeliver({
              ruleKey: rule.ruleKey,
              resourceType: 'CorrectiveAction',
              resourceId: capa.id,
              stage: rule.stage,
              recipientId: recipient.id,
              recipientRole: recipient.role,
              occurredAt: now,
              notificationPayload: {
                type: NotificationType.CAPA_DUE,
                title: `${rule.titleTemplate}: ${capa.title}`,
                body: `Corrective Action is due tomorrow on ${capa.dueAt.toISOString().split('T')[0]}.`,
                resourceType: 'CorrectiveAction',
                resourceId: capa.id,
                severity: rule.severity,
                metadata: {
                  capaId: capa.id,
                  violationId: capa.violationId,
                  dueAt: capa.dueAt,
                },
              },
            });

            if (res.outcome === 'SENT') summary.capaEscalationsSent++;
            else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
            else if (res.outcome === 'FAILED') summary.failedCount++;
          }
        }
        // Stage 1 Due: Due in <= 3 days (> 1 day)
        else if (diffDays <= 3 && diffDays > 1) {
          const rule = ALERT_RULES_CONFIG.rules.CAPA_DUE_3D;
          const res = await this.escalationService.recordAndDeliver({
            ruleKey: rule.ruleKey,
            resourceType: 'CorrectiveAction',
            resourceId: capa.id,
            stage: rule.stage,
            recipientId: capa.assignedTo.id,
            recipientRole: capa.assignedTo.role,
            occurredAt: now,
            notificationPayload: {
              type: NotificationType.CAPA_DUE,
              title: `${rule.titleTemplate}: ${capa.title}`,
              body: `Corrective Action is due in ${Math.ceil(diffDays)} days on ${capa.dueAt.toISOString().split('T')[0]}.`,
              resourceType: 'CorrectiveAction',
              resourceId: capa.id,
              severity: rule.severity,
              metadata: {
                capaId: capa.id,
                violationId: capa.violationId,
                dueAt: capa.dueAt,
              },
            },
          });

          if (res.outcome === 'SENT') summary.capaEscalationsSent++;
          else if (res.outcome === 'SKIPPED') summary.skippedIdempotent++;
          else if (res.outcome === 'FAILED') summary.failedCount++;
        }
      } catch (err: any) {
        this.logger.error(`Error processing CorrectiveAction "${capa.id}": ${err.message}`);
        summary.failedCount++;
      }
    }
  }

  // ─── Recipient Derivation Helpers ──────────────────────────────────────────

  public async getRecipientsForMine(mineId: string, companyId?: string): Promise<{ id: string; role: string }[]> {
    // Mine-assigned officials
    const assignments = await this.prisma.userMineAssignment.findMany({
      where: { mineId, active: true },
      include: { user: true },
    });

    let users = assignments
      .map((a) => a.user)
      .filter((u) => u.status === UserStatus.ACTIVE);

    // Fallback: If no explicit assignment, pick active mine officials of that company
    if (users.length === 0 && companyId) {
      users = await this.prisma.user.findMany({
        where: {
          companyId,
          role: UserRole.MINE_OFFICIAL,
          status: UserStatus.ACTIVE,
        },
      });
    }

    return this.deduplicateUsers(users);
  }

  public async getRecipientsForCompliance7Days(record: any): Promise<{ id: string; role: string }[]> {
    const mineOfficials = await this.getRecipientsForMine(record.mineId, record.mine.companyId);
    const corporateUsers = await this.prisma.user.findMany({
      where: {
        companyId: record.mine.companyId,
        role: UserRole.CORPORATE,
        status: UserStatus.ACTIVE,
      },
    });

    return this.deduplicateUsers([...mineOfficials, ...corporateUsers]);
  }

  public async getRecipientsForComplianceOverdue(record: any): Promise<{ id: string; role: string }[]> {
    const mineOfficials = await this.getRecipientsForMine(record.mineId, record.mine.companyId);
    const corporateUsers = await this.prisma.user.findMany({
      where: {
        companyId: record.mine.companyId,
        role: UserRole.CORPORATE,
        status: UserStatus.ACTIVE,
      },
    });
    const regulators = await this.prisma.user.findMany({
      where: {
        role: UserRole.REGULATOR,
        status: UserStatus.ACTIVE,
      },
    });

    return this.deduplicateUsers([...mineOfficials, ...corporateUsers, ...regulators]);
  }

  public async getRecipientsForCapaStage1Overdue(capa: any): Promise<{ id: string; role: string }[]> {
    const mineOfficials = await this.getRecipientsForMine(
      capa.violation.mineId,
      capa.violation.mine?.companyId,
    );
    return this.deduplicateUsers([capa.assignedTo, ...mineOfficials]);
  }

  public async getRecipientsForCapaStage2Overdue(capa: any): Promise<{ id: string; role: string }[]> {
    const corporateUsers = await this.prisma.user.findMany({
      where: {
        companyId: capa.violation.mine?.companyId,
        role: UserRole.CORPORATE,
        status: UserStatus.ACTIVE,
      },
    });
    const regulators = await this.prisma.user.findMany({
      where: {
        role: UserRole.REGULATOR,
        status: UserStatus.ACTIVE,
      },
    });

    return this.deduplicateUsers([capa.assignedTo, ...corporateUsers, ...regulators]);
  }

  public async getRecipientsForViolationRaised(mineId: string, companyId: string): Promise<{ id: string; role: string }[]> {
    const mineOfficials = await this.getRecipientsForMine(mineId, companyId);
    const corporateUsers = await this.prisma.user.findMany({
      where: {
        companyId,
        role: UserRole.CORPORATE,
        status: UserStatus.ACTIVE,
      },
    });
    const regulators = await this.prisma.user.findMany({
      where: {
        role: UserRole.REGULATOR,
        status: UserStatus.ACTIVE,
      },
    });

    return this.deduplicateUsers([...mineOfficials, ...corporateUsers, ...regulators]);
  }

  private deduplicateUsers(users: { id: string; role: string }[]): { id: string; role: string }[] {
    const map = new Map<string, { id: string; role: string }>();
    for (const u of users) {
      if (!map.has(u.id)) {
        map.set(u.id, { id: u.id, role: u.role });
      }
    }
    return Array.from(map.values());
  }
}
