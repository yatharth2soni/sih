import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { EscalationService } from '../alerts/escalation.service';
import { RISK_SCORING_CONFIG } from '../config/risk-scoring.config';
import { QueryRiskScoresDto } from './dto/query-risk-scores.dto';
import { QueryAnomaliesDto } from './dto/query-anomalies.dto';
import {
  RiskBand,
  AnomalyType,
  AnomalyStatus,
  ComplianceStatus,
  InspectionStatus,
  CapaStatus,
  NotificationType,
  UserRole,
  Prisma,
} from '@prisma/client';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class RiskScoringService {
  private readonly logger = new Logger(RiskScoringService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    private escalationService: EscalationService,
  ) {}

  /**
   * Determine RiskBand from a 0-100 integer score.
   */
  public determineBand(score: number): RiskBand {
    if (score <= 25) return RiskBand.LOW;
    if (score <= 50) return RiskBand.MEDIUM;
    if (score <= 75) return RiskBand.HIGH;
    return RiskBand.CRITICAL;
  }

  /**
   * Generate human-readable narrative explaining the primary risk drivers.
   */
  public generateExplanation(
    mineName: string,
    score: number,
    band: RiskBand,
    factors: any,
    sourceCounts: any,
  ): string {
    const drivers: string[] = [];

    if (factors.violations.weightedScore >= 15) {
      drivers.push(
        `elevated statutory violations (${sourceCounts.criticalViolations} critical, ${sourceCounts.totalViolations} total in last 30d)`,
      );
    }
    if (factors.capas.weightedScore >= 10) {
      drivers.push(
        `delayed corrective actions (${sourceCounts.overdueCapas} overdue CAPAs)`,
      );
    }
    if (factors.compliance.weightedScore >= 10) {
      drivers.push(
        `statutory compliance deficits (${sourceCounts.nonCompliantRecords} non-compliant, ${sourceCounts.overdueCompliance} overdue returns)`,
      );
    }
    if (factors.inspectionGap.weightedScore >= 10) {
      drivers.push(
        `inspection velocity gap (${sourceCounts.completedInspections} completed inspections in window)`,
      );
    }

    if (drivers.length === 0) {
      return `${mineName} maintains a ${band} risk profile (Score: ${score}/100). Safety observations, statutory compliance returns, and corrective action lifecycles are operating within standard tolerance thresholds.`;
    }

    return `${mineName} has a ${band} risk score of ${score}/100, primarily driven by ${drivers.join(' and ')}. Immediate management remediation and statutory review are advised.`;
  }

  /**
   * Calculate deterministic risk score snapshot & detect anomalies for a single mine.
   */
  async calculateMineRiskScore(mineId: string, nowInput?: Date) {
    const windowEnd = nowInput || new Date();
    const windowStart = new Date(
      windowEnd.getTime() - RISK_SCORING_CONFIG.windowDays * 24 * 3600 * 1000,
    );
    const baselineStart = new Date(
      windowStart.getTime() -
        RISK_SCORING_CONFIG.baselineWindowDays * 24 * 3600 * 1000,
    );
    const baselineEnd = windowStart;

    const mine = await this.prisma.mine.findUnique({
      where: { id: mineId },
      include: { company: true },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine "${mineId}" not found`,
      });
    }

    // 1. Fetch current window & baseline violations
    const [currentViolations, baselineViolations] = await Promise.all([
      this.prisma.violation.findMany({
        where: {
          mineId,
          raisedAt: { gte: windowStart, lte: windowEnd },
        },
      }),
      this.prisma.violation.findMany({
        where: {
          mineId,
          raisedAt: { gte: baselineStart, lte: baselineEnd },
        },
      }),
    ]);

    const criticalViolations = currentViolations.filter(
      (v) => v.severity === 'CRITICAL',
    ).length;
    const highViolations = currentViolations.filter(
      (v) => v.severity === 'HIGH',
    ).length;
    const mediumViolations = currentViolations.filter(
      (v) => v.severity === 'MEDIUM',
    ).length;
    const lowViolations = currentViolations.filter(
      (v) => v.severity === 'LOW',
    ).length;

    const violationRawPoints =
      criticalViolations *
        RISK_SCORING_CONFIG.pointScale.violations.CRITICAL +
      highViolations * RISK_SCORING_CONFIG.pointScale.violations.HIGH +
      mediumViolations * RISK_SCORING_CONFIG.pointScale.violations.MEDIUM +
      lowViolations * RISK_SCORING_CONFIG.pointScale.violations.LOW;

    const violationNormalized = Math.min(
      100,
      (violationRawPoints /
        RISK_SCORING_CONFIG.pointScale.violations.maxPointsDenominator) *
        100,
    );
    const violationWeightedScore =
      Math.round(
        violationNormalized * RISK_SCORING_CONFIG.weights.violations * 10,
      ) / 10;

    // 2. Fetch CAPA performance
    const capas = await this.prisma.correctiveAction.findMany({
      where: { violation: { mineId } },
    });

    const overdueCapas = capas.filter(
      (c) => c.status !== CapaStatus.CLOSED && c.dueAt < windowEnd,
    ).length;
    const openCapas = capas.filter(
      (c) =>
        (c.status === CapaStatus.OPEN || c.status === CapaStatus.IN_PROGRESS) &&
        c.dueAt >= windowEnd,
    ).length;

    const capaRawPoints =
      overdueCapas * RISK_SCORING_CONFIG.pointScale.capas.overdue +
      openCapas * RISK_SCORING_CONFIG.pointScale.capas.openOrInProgress;

    const capaNormalized = Math.min(
      100,
      (capaRawPoints /
        RISK_SCORING_CONFIG.pointScale.capas.maxPointsDenominator) *
        100,
    );
    const capaWeightedScore =
      Math.round(capaNormalized * RISK_SCORING_CONFIG.weights.capas * 10) / 10;

    // 3. Fetch Compliance Health
    const complianceRecords = await this.prisma.complianceRecord.findMany({
      where: { mineId },
    });

    const nonCompliantRecords = complianceRecords.filter(
      (r) => r.status === ComplianceStatus.NON_COMPLIANT,
    ).length;
    const overdueCompliance = complianceRecords.filter(
      (r) =>
        r.nextDueAt &&
        r.nextDueAt < windowEnd &&
        r.status !== ComplianceStatus.COMPLIANT,
    ).length;
    const pendingCompliance = complianceRecords.filter(
      (r) => r.status === ComplianceStatus.PENDING,
    ).length;

    const compRawPoints =
      nonCompliantRecords *
        RISK_SCORING_CONFIG.pointScale.compliance.NON_COMPLIANT +
      overdueCompliance * RISK_SCORING_CONFIG.pointScale.compliance.OVERDUE +
      pendingCompliance * RISK_SCORING_CONFIG.pointScale.compliance.PENDING;

    const compNormalized = Math.min(
      100,
      (compRawPoints /
        RISK_SCORING_CONFIG.pointScale.compliance.maxPointsDenominator) *
        100,
    );
    const compWeightedScore =
      Math.round(compNormalized * RISK_SCORING_CONFIG.weights.compliance * 10) /
      10;

    // 4. Fetch Inspection Velocity Gap
    const inspections = await this.prisma.inspection.findMany({
      where: {
        mineId,
        scheduledFor: { gte: windowStart, lte: windowEnd },
      },
    });

    const completedInspections = inspections.filter(
      (i) => i.status === InspectionStatus.COMPLETED,
    ).length;

    let inspectionRawPoints = 0;
    if (inspections.length === 0) {
      inspectionRawPoints =
        RISK_SCORING_CONFIG.pointScale.inspectionGap.noInspectionsPoints;
    } else {
      const completionRate = completedInspections / inspections.length;
      inspectionRawPoints = (1.0 - completionRate) * 100;
    }

    const inspectionNormalized = Math.min(100, inspectionRawPoints);
    const inspectionWeightedScore =
      Math.round(
        inspectionNormalized *
          RISK_SCORING_CONFIG.weights.inspectionGap *
          10,
      ) / 10;

    // 5. Final Score & Band
    const rawTotal =
      violationWeightedScore +
      capaWeightedScore +
      compWeightedScore +
      inspectionWeightedScore;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));
    const band = this.determineBand(finalScore);

    const factors = {
      violations: {
        weight: RISK_SCORING_CONFIG.weights.violations,
        rawPoints: violationRawPoints,
        normalizedScore: Math.round(violationNormalized * 10) / 10,
        weightedScore: violationWeightedScore,
        counts: {
          critical: criticalViolations,
          high: highViolations,
          medium: mediumViolations,
          low: lowViolations,
          total: currentViolations.length,
        },
      },
      capas: {
        weight: RISK_SCORING_CONFIG.weights.capas,
        rawPoints: capaRawPoints,
        normalizedScore: Math.round(capaNormalized * 10) / 10,
        weightedScore: capaWeightedScore,
        counts: { overdue: overdueCapas, open: openCapas },
      },
      compliance: {
        weight: RISK_SCORING_CONFIG.weights.compliance,
        rawPoints: compRawPoints,
        normalizedScore: Math.round(compNormalized * 10) / 10,
        weightedScore: compWeightedScore,
        counts: {
          nonCompliant: nonCompliantRecords,
          overdue: overdueCompliance,
          pending: pendingCompliance,
        },
      },
      inspectionGap: {
        weight: RISK_SCORING_CONFIG.weights.inspectionGap,
        rawPoints: Math.round(inspectionRawPoints * 10) / 10,
        normalizedScore: Math.round(inspectionNormalized * 10) / 10,
        weightedScore: inspectionWeightedScore,
        counts: {
          total: inspections.length,
          completed: completedInspections,
        },
      },
    };

    const sourceCounts = {
      totalViolations: currentViolations.length,
      criticalViolations,
      overdueCapas,
      nonCompliantRecords,
      overdueCompliance,
      completedInspections,
    };

    const plainLanguageExplanation = this.generateExplanation(
      mine.name,
      finalScore,
      band,
      factors,
      sourceCounts,
    );

    // 6. Create RiskScore Snapshot in DB
    const riskScore = await this.prisma.riskScore.create({
      data: {
        mineId,
        companyId: mine.companyId,
        score: finalScore,
        band,
        calculationVersion: RISK_SCORING_CONFIG.version,
        calculatedAt: windowEnd,
        windowStart,
        windowEnd,
        factors,
        sourceCounts,
        plainLanguageExplanation,
      },
    });

    // 7. Anomaly Detection & Anomaly Flags Creation
    const detectedAnomalies: any[] = [];
    const dateKey = windowStart.toISOString().split('T')[0];

    // 7a. VIOLATION_SPIKE
    const vSpikeThresh =
      RISK_SCORING_CONFIG.anomalyThresholds.violationSpike;
    const currentVCount = currentViolations.length;
    const baselineVCount = baselineViolations.length;
    const absoluteIncrease = currentVCount - baselineVCount;

    if (
      currentVCount >= vSpikeThresh.minCurrentViolations &&
      absoluteIncrease >= vSpikeThresh.minAbsoluteIncrease &&
      (baselineVCount === 0 ||
        currentVCount >=
          baselineVCount * vSpikeThresh.relativeSurgeMultiplier)
    ) {
      const dedupKey = `${mineId}:VIOLATION_SPIKE:${dateKey}`;
      const anomaly = await this.prisma.anomalyFlag.upsert({
        where: { dedupKey },
        update: {
          relatedRiskScoreId: riskScore.id,
          observed: { currentViolationsCount: currentVCount },
        },
        create: {
          mineId,
          type: AnomalyType.VIOLATION_SPIKE,
          status: AnomalyStatus.OPEN,
          detectedAt: windowEnd,
          baseline: {
            windowStart: baselineStart,
            windowEnd: baselineEnd,
            violationsCount: baselineVCount,
          },
          observed: {
            windowStart,
            windowEnd,
            violationsCount: currentVCount,
            criticalCount: criticalViolations,
          },
          threshold: `violations >= ${vSpikeThresh.minCurrentViolations}, surge >= +${vSpikeThresh.minAbsoluteIncrease}, relative >= 2.0x`,
          calculationVersion: RISK_SCORING_CONFIG.version,
          relatedRiskScoreId: riskScore.id,
          dedupKey,
        },
      });
      detectedAnomalies.push(anomaly);
    }

    // 7b. OVERDUE_CAPA_CLUSTER
    const capaClusterThresh =
      RISK_SCORING_CONFIG.anomalyThresholds.overdueCapaCluster;
    if (overdueCapas >= capaClusterThresh.minOverdueCapas) {
      const dedupKey = `${mineId}:OVERDUE_CAPA_CLUSTER:${dateKey}`;
      const anomaly = await this.prisma.anomalyFlag.upsert({
        where: { dedupKey },
        update: {
          relatedRiskScoreId: riskScore.id,
          observed: { overdueCapasCount: overdueCapas },
        },
        create: {
          mineId,
          type: AnomalyType.OVERDUE_CAPA_CLUSTER,
          status: AnomalyStatus.OPEN,
          detectedAt: windowEnd,
          baseline: { threshold: capaClusterThresh.minOverdueCapas },
          observed: { overdueCapasCount: overdueCapas },
          threshold: `overdue CAPAs >= ${capaClusterThresh.minOverdueCapas}`,
          calculationVersion: RISK_SCORING_CONFIG.version,
          relatedRiskScoreId: riskScore.id,
          dedupKey,
        },
      });
      detectedAnomalies.push(anomaly);
    }

    // 7c. RECURRING_NON_COMPLIANCE
    const recurThresh =
      RISK_SCORING_CONFIG.anomalyThresholds.recurringNonCompliance;
    if (nonCompliantRecords >= recurThresh.minNonCompliantRecords) {
      const dedupKey = `${mineId}:RECURRING_NON_COMPLIANCE:${dateKey}`;
      const anomaly = await this.prisma.anomalyFlag.upsert({
        where: { dedupKey },
        update: {
          relatedRiskScoreId: riskScore.id,
          observed: { nonCompliantRecordsCount: nonCompliantRecords },
        },
        create: {
          mineId,
          type: AnomalyType.RECURRING_NON_COMPLIANCE,
          status: AnomalyStatus.OPEN,
          detectedAt: windowEnd,
          baseline: { threshold: recurThresh.minNonCompliantRecords },
          observed: { nonCompliantRecordsCount: nonCompliantRecords },
          threshold: `non-compliant records >= ${recurThresh.minNonCompliantRecords}`,
          calculationVersion: RISK_SCORING_CONFIG.version,
          relatedRiskScoreId: riskScore.id,
          dedupKey,
        },
      });
      detectedAnomalies.push(anomaly);
    }

    // 8. Phase 7 In-App Alert Notifications
    if (band === RiskBand.HIGH || band === RiskBand.CRITICAL) {
      await this.escalateHighRisk(mine, riskScore, windowEnd);
    }

    return { riskScore, anomalies: detectedAnomalies };
  }

  /**
   * Phase 7 notification dispatch for High/Critical Risk Score.
   */
  private async escalateHighRisk(
    mine: any,
    riskScore: any,
    nowDate: Date,
  ) {
    const recipients = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { in: [UserRole.ADMIN, UserRole.REGULATOR] } },
          { role: UserRole.CORPORATE, companyId: mine.companyId },
          {
            role: UserRole.MINE_OFFICIAL,
            mineAssignments: { some: { mineId: mine.id, active: true } },
          },
        ],
      },
    });

    const dateKey = riskScore.calculatedAt.toISOString().split('T')[0];

    for (const recipient of recipients) {
      await this.escalationService.recordAndDeliver({
        ruleKey: `RISK_HIGH_${riskScore.band}`,
        resourceType: 'MineRiskScore',
        resourceId: `${mine.id}:${dateKey}`,
        stage: riskScore.band === RiskBand.CRITICAL ? 2 : 1,
        recipientId: recipient.id,
        recipientRole: recipient.role,
        occurredAt: nowDate,
        notificationPayload: {
          type: NotificationType.RISK_HIGH,
          title: `⚠️ ${riskScore.band} Risk Score Detected — ${mine.name}`,
          body: riskScore.plainLanguageExplanation,
          severity: riskScore.band === RiskBand.CRITICAL ? 'CRITICAL' : 'HIGH',
          resourceType: 'RiskScore',
          resourceId: riskScore.id,
          metadata: {
            mineId: mine.id,
            score: riskScore.score,
            band: riskScore.band,
          },
        },
      });
    }
  }

  /**
   * Recalculate scores for all active mines in the platform.
   */
  async recalculateAllMines(nowDate: Date, specificMineId?: string) {
    const where: Prisma.MineWhereInput = { status: 'ACTIVE' };
    if (specificMineId) where.id = specificMineId;

    const mines = await this.prisma.mine.findMany({ where });
    const results: any[] = [];

    for (const mine of mines) {
      const res = await this.calculateMineRiskScore(mine.id, nowDate);
      results.push({
        mineId: mine.id,
        mineName: mine.name,
        mineCode: mine.code,
        score: res.riskScore.score,
        band: res.riskScore.band,
        anomaliesCount: res.anomalies.length,
      });
    }

    return {
      calculatedAt: nowDate,
      totalMinesProcessed: results.length,
      mines: results,
    };
  }

  /**
   * Query historical or latest risk scores with scope filtering.
   */
  async getRiskScores(
    query: QueryRiskScoresDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.RiskScoreWhereInput = {};

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
      where.companyId = query.companyId;
    }

    if (query.band) {
      where.band = query.band;
    }

    if (query.from || query.to) {
      where.calculatedAt = {};
      if (query.from) where.calculatedAt.gte = new Date(query.from);
      if (query.to) where.calculatedAt.lte = new Date(query.to);
    }

    if (query.latestOnly) {
      // Query latest score per mine
      const targetMines = await this.prisma.mine.findMany({
        where: accessibleMineIds ? { id: { in: accessibleMineIds } } : {},
        select: { id: true },
      });

      const latestScores: any[] = [];
      for (const m of targetMines) {
        const latest = await this.prisma.riskScore.findFirst({
          where: { ...where, mineId: m.id },
          orderBy: { calculatedAt: 'desc' },
          include: {
            mine: { select: { id: true, name: true, code: true } },
            company: { select: { id: true, name: true, code: true } },
          },
        });
        if (latest) latestScores.push(latest);
      }

      return {
        data: latestScores.slice(skip, skip + pageSize),
        meta: {
          page,
          pageSize,
          total: latestScores.length,
          totalPages: Math.ceil(latestScores.length / pageSize),
        },
      };
    }

    const [scores, total] = await Promise.all([
      this.prisma.riskScore.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { calculatedAt: 'desc' },
        include: {
          mine: { select: { id: true, name: true, code: true } },
          company: { select: { id: true, name: true, code: true } },
        },
      }),
      this.prisma.riskScore.count({ where }),
    ]);

    return {
      data: scores,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get latest risk score details for a specific mine.
   */
  async getLatestMineRiskScore(mineId: string, user: RequestUser) {
    await this.scopeService.assertMineAccess(user, mineId);

    const latest = await this.prisma.riskScore.findFirst({
      where: { mineId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        mine: { select: { id: true, name: true, code: true } },
        company: { select: { id: true, name: true, code: true } },
        anomalies: { where: { status: { in: [AnomalyStatus.OPEN, AnomalyStatus.ACKNOWLEDGED] } } },
      },
    });

    if (!latest) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `No risk score calculated yet for mine "${mineId}"`,
      });
    }

    return latest;
  }

  /**
   * Query anomaly flags.
   */
  async getAnomalies(
    query: QueryAnomaliesDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AnomalyFlagWhereInput = {};

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

    if (query.type) {
      where.type = query.type;
    }

    if (query.from || query.to) {
      where.detectedAt = {};
      if (query.from) where.detectedAt.gte = new Date(query.from);
      if (query.to) where.detectedAt.lte = new Date(query.to);
    }

    const [anomalies, total] = await Promise.all([
      this.prisma.anomalyFlag.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { detectedAt: 'desc' },
        include: {
          mine: {
            select: {
              id: true,
              name: true,
              code: true,
              company: { select: { id: true, name: true, code: true } },
            },
          },
          actionBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.anomalyFlag.count({ where }),
    ]);

    return {
      data: anomalies,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Acknowledge an open anomaly flag.
   */
  async acknowledgeAnomaly(
    id: string,
    reason: string | undefined,
    user: RequestUser,
  ) {
    const anomaly = await this.prisma.anomalyFlag.findUnique({
      where: { id },
    });

    if (!anomaly) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Anomaly "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, anomaly.mineId);

    if (anomaly.status !== AnomalyStatus.OPEN) {
      throw new BadRequestException({
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot acknowledge anomaly in "${anomaly.status}" status (must be OPEN)`,
      });
    }

    return this.prisma.anomalyFlag.update({
      where: { id },
      data: {
        status: AnomalyStatus.ACKNOWLEDGED,
        actionReason: reason || 'Acknowledged by authorized official',
        actionById: user.id,
        actionAt: new Date(),
      },
    });
  }

  /**
   * Resolve an acknowledged or open anomaly flag.
   */
  async resolveAnomaly(id: string, reason: string, user: RequestUser) {
    const anomaly = await this.prisma.anomalyFlag.findUnique({
      where: { id },
    });

    if (!anomaly) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Anomaly "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, anomaly.mineId);

    if (
      anomaly.status !== AnomalyStatus.OPEN &&
      anomaly.status !== AnomalyStatus.ACKNOWLEDGED
    ) {
      throw new BadRequestException({
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot resolve anomaly in "${anomaly.status}" status`,
      });
    }

    return this.prisma.anomalyFlag.update({
      where: { id },
      data: {
        status: AnomalyStatus.RESOLVED,
        actionReason: reason,
        actionById: user.id,
        actionAt: new Date(),
      },
    });
  }

  /**
   * Dismiss an anomaly flag with mandatory justification.
   */
  async dismissAnomaly(id: string, reason: string, user: RequestUser) {
    const anomaly = await this.prisma.anomalyFlag.findUnique({
      where: { id },
    });

    if (!anomaly) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Anomaly "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, anomaly.mineId);

    if (
      anomaly.status !== AnomalyStatus.OPEN &&
      anomaly.status !== AnomalyStatus.ACKNOWLEDGED
    ) {
      throw new BadRequestException({
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot dismiss anomaly in "${anomaly.status}" status`,
      });
    }

    return this.prisma.anomalyFlag.update({
      where: { id },
      data: {
        status: AnomalyStatus.DISMISSED,
        actionReason: reason,
        actionById: user.id,
        actionAt: new Date(),
      },
    });
  }
}
