import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import {
  ComplianceStatus,
  InspectionStatus,
  ViolationStatus,
  CapaStatus,
  UserRole,
  Prisma,
} from '@prisma/client';

export interface DeltaMetric {
  current: number;
  prior: number;
  percentChange: number; // e.g. +15.5 or -5.0
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Calculate date ranges: current window [from, to] and prior window [from - D, from].
   */
  private resolveDateWindows(query: QueryDashboardDto) {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 30 * 24 * 3600 * 1000); // default 30-day window

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: '"from" date must be earlier than or equal to "to" date',
      });
    }

    const windowDurationMs = to.getTime() - from.getTime();
    const priorTo = new Date(from.getTime());
    const priorFrom = new Date(from.getTime() - windowDurationMs);

    return { from, to, priorFrom, priorTo, windowDurationMs };
  }

  /**
   * Safe percent change calculation with zero-division rules.
   */
  public calculatePercentChange(current: number, prior: number): number {
    if (prior === 0) {
      if (current === 0) return 0.0;
      return 100.0; // 0 -> positive is a 100% surge
    }
    const change = ((current - prior) / prior) * 100;
    return Math.round(change * 10) / 10;
  }

  /**
   * 1. Mine-Level Overview Dashboard
   */
  async getMineOverview(
    mineId: string,
    query: QueryDashboardDto,
    user: RequestUser,
  ) {
    await this.scopeService.assertMineAccess(user, mineId);

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

    const { from, to, priorFrom, priorTo } = this.resolveDateWindows(query);

    // 1. Compliance Breakdown
    const complianceRecords = await this.prisma.complianceRecord.findMany({
      where: { mineId },
      include: { requirement: true },
    });

    let compliantCount = 0;
    let nonCompliantCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;

    const dueSoonThreshold = new Date(to.getTime() + 14 * 24 * 3600 * 1000);

    for (const rec of complianceRecords) {
      if (rec.status === ComplianceStatus.NON_COMPLIANT) {
        nonCompliantCount++;
      } else if (rec.status === ComplianceStatus.COMPLIANT) {
        compliantCount++;
      }

      if (rec.nextDueAt) {
        if (rec.nextDueAt < to && rec.status !== ComplianceStatus.COMPLIANT) {
          overdueCount++;
        } else if (rec.nextDueAt >= to && rec.nextDueAt <= dueSoonThreshold) {
          dueSoonCount++;
        }
      }
    }

    const totalCompliance = complianceRecords.length;
    const complianceRate =
      totalCompliance > 0
        ? Math.round((compliantCount / totalCompliance) * 1000) / 10
        : 100.0;

    // 2. Inspections & Completion Rate (Current vs Prior)
    const [currentInspections, priorInspections] = await Promise.all([
      this.prisma.inspection.findMany({
        where: {
          mineId,
          scheduledFor: { gte: from, lte: to },
        },
      }),
      this.prisma.inspection.findMany({
        where: {
          mineId,
          scheduledFor: { gte: priorFrom, lte: priorTo },
        },
      }),
    ]);

    const completedInspections = currentInspections.filter(
      (i) => i.status === InspectionStatus.COMPLETED,
    ).length;
    const inProgressInspections = currentInspections.filter(
      (i) => i.status === InspectionStatus.IN_PROGRESS,
    ).length;
    const scheduledInspections = currentInspections.filter(
      (i) => i.status === InspectionStatus.SCHEDULED,
    ).length;

    const inspectionCompletionRate =
      currentInspections.length > 0
        ? Math.round(
            (completedInspections / currentInspections.length) * 1000,
          ) / 10
        : 0.0;

    // 3. Violations Metrics & Distributions
    const [currentViolations, priorViolations] = await Promise.all([
      this.prisma.violation.findMany({
        where: {
          mineId,
          raisedAt: { gte: from, lte: to },
        },
        include: { complianceRequirement: true },
      }),
      this.prisma.violation.findMany({
        where: {
          mineId,
          raisedAt: { gte: priorFrom, lte: priorTo },
        },
      }),
    ]);

    const violationsOpened = currentViolations.length;
    const violationsResolved = currentViolations.filter(
      (v) => v.status === ViolationStatus.RESOLVED,
    ).length;

    const severityDistribution = {
      CRITICAL: currentViolations.filter((v) => v.severity === 'CRITICAL').length,
      HIGH: currentViolations.filter((v) => v.severity === 'HIGH').length,
      MEDIUM: currentViolations.filter((v) => v.severity === 'MEDIUM').length,
      LOW: currentViolations.filter((v) => v.severity === 'LOW').length,
    };

    const categoryDistribution: Record<string, number> = {
      SAFETY: 0,
      ENVIRONMENT: 0,
      LABOUR: 0,
      PRODUCTION: 0,
    };
    for (const v of currentViolations) {
      const cat = v.complianceRequirement?.category || 'SAFETY';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    }

    // 4. Corrective Actions (CAPA) Performance
    const capas = await this.prisma.correctiveAction.findMany({
      where: {
        violation: { mineId },
      },
    });

    const capaOpen = capas.filter((c) => c.status === CapaStatus.OPEN).length;
    const capaInProgress = capas.filter((c) => c.status === CapaStatus.IN_PROGRESS).length;
    const capaClosed = capas.filter((c) => c.status === CapaStatus.CLOSED).length;
    const capaOverdue = capas.filter(
      (c) => c.status !== CapaStatus.CLOSED && c.dueAt < to,
    ).length;

    const capaClosureRate =
      capas.length > 0
        ? Math.round((capaClosed / capas.length) * 1000) / 10
        : 0.0;

    // Calculate average time to close (hours) for closed CAPAs with valid closedAt
    const closedWithTimestamps = capas.filter(
      (c) => c.status === CapaStatus.CLOSED && c.closedAt && c.createdAt,
    );
    let averageTimeToCloseHours = 0.0;
    if (closedWithTimestamps.length > 0) {
      const totalDurationHours = closedWithTimestamps.reduce((acc, c) => {
        const diffHours =
          (c.closedAt!.getTime() - c.createdAt.getTime()) / (1000 * 3600);
        return acc + Math.max(0, diffHours);
      }, 0);
      averageTimeToCloseHours =
        Math.round((totalDurationHours / closedWithTimestamps.length) * 10) / 10;
    }

    // 5. Deduplicated At-Risk Resources Count
    const atRiskResourceKeys = new Set<string>();
    currentViolations
      .filter((v) => v.status === ViolationStatus.OPEN && v.severity === 'CRITICAL')
      .forEach((v) => atRiskResourceKeys.add(`Violation:${v.id}`));
    complianceRecords
      .filter((r) => r.nextDueAt && r.nextDueAt < to && r.status !== ComplianceStatus.COMPLIANT)
      .forEach((r) => atRiskResourceKeys.add(`ComplianceRecord:${r.id}`));
    capas
      .filter((c) => c.status !== CapaStatus.CLOSED && c.dueAt < to)
      .forEach((c) => atRiskResourceKeys.add(`CorrectiveAction:${c.id}`));

    // 6. Action Lists: Top High-Severity Violations & Overdue CAPAs
    const [recentViolations, overdueCapas, upcomingCompliance] =
      await Promise.all([
        this.prisma.violation.findMany({
          where: {
            mineId,
            status: { in: [ViolationStatus.OPEN, ViolationStatus.UNDER_REVIEW] },
          },
          orderBy: { raisedAt: 'desc' },
          take: 5,
          include: { complianceRequirement: { select: { title: true } } },
        }),
        this.prisma.correctiveAction.findMany({
          where: {
            violation: { mineId },
            status: { not: CapaStatus.CLOSED },
            dueAt: { lt: to },
          },
          orderBy: { dueAt: 'asc' },
          take: 5,
          include: { assignedTo: { select: { name: true, email: true } } },
        }),
        this.prisma.complianceRecord.findMany({
          where: {
            mineId,
            nextDueAt: { gte: from, lte: dueSoonThreshold },
          },
          orderBy: { nextDueAt: 'asc' },
          take: 5,
          include: { requirement: { select: { title: true, category: true } } },
        }),
      ]);

    // 7. Time-Series Trends
    const trends = this.buildTimeSeriesTrend(currentViolations, currentInspections, from, to);

    return {
      mine: {
        id: mine.id,
        name: mine.name,
        code: mine.code,
        location: mine.location,
        company: { id: mine.company.id, name: mine.company.name, code: mine.company.code },
      },
      window: { from, to, priorFrom, priorTo },
      kpis: {
        complianceRate: {
          value: complianceRate,
          total: totalCompliance,
          compliant: compliantCount,
          nonCompliant: nonCompliantCount,
          dueSoon: dueSoonCount,
          overdue: overdueCount,
        },
        inspections: {
          current: currentInspections.length,
          prior: priorInspections.length,
          percentChange: this.calculatePercentChange(
            currentInspections.length,
            priorInspections.length,
          ),
          completed: completedInspections,
          inProgress: inProgressInspections,
          scheduled: scheduledInspections,
          completionRate: inspectionCompletionRate,
        },
        violations: {
          current: violationsOpened,
          prior: priorViolations.length,
          percentChange: this.calculatePercentChange(
            violationsOpened,
            priorViolations.length,
          ),
          resolved: violationsResolved,
        },
        capa: {
          open: capaOpen,
          inProgress: capaInProgress,
          closed: capaClosed,
          overdue: capaOverdue,
          closureRate: capaClosureRate,
          averageTimeToCloseHours,
        },
        atRiskResourcesCount: atRiskResourceKeys.size,
      },
      distributions: {
        severity: severityDistribution,
        category: categoryDistribution,
      },
      actionItems: {
        recentHighSeverityViolations: recentViolations,
        overdueCorrectiveActions: overdueCapas,
        upcomingComplianceDeadlines: upcomingCompliance,
      },
      trends,
    };
  }

  /**
   * 2. Company-Level Overview Dashboard
   */
  async getCompanyOverview(
    companyId: string,
    query: QueryDashboardDto,
    user: RequestUser,
  ) {
    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (dbUser?.companyId !== companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot access analytics for another company',
        });
      }
    }

    if (user.role === UserRole.MINE_OFFICIAL) {
      const assignments = await this.prisma.userMineAssignment.findMany({
        where: { userId: user.id, active: true, mine: { companyId } },
      });
      if (assignments.length === 0) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You do not have assigned mines under this company',
        });
      }
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        mines: { where: { status: 'ACTIVE' } },
      },
    });

    if (!company) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Company "${companyId}" not found`,
      });
    }

    const { from, to, priorFrom, priorTo } = this.resolveDateWindows(query);

    let targetMineIds = company.mines.map((m) => m.id);
    if (query.mineId) {
      if (!targetMineIds.includes(query.mineId)) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `Mine "${query.mineId}" does not belong to company "${company.code}"`,
        });
      }
      if (user.role === UserRole.MINE_OFFICIAL) {
        await this.scopeService.assertMineAccess(user, query.mineId);
      }
      targetMineIds = [query.mineId];
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessible = await this.scopeService.getAccessibleMineIds(user);
      if (accessible) {
        targetMineIds = targetMineIds.filter((id) => accessible.includes(id));
      }
    }

    // Aggregated Compliance across company mines
    const complianceRecords = await this.prisma.complianceRecord.findMany({
      where: { mineId: { in: targetMineIds } },
    });

    let compliantCount = 0;
    let nonCompliantCount = 0;
    let overdueCount = 0;
    for (const r of complianceRecords) {
      if (r.status === ComplianceStatus.COMPLIANT) compliantCount++;
      else if (r.status === ComplianceStatus.NON_COMPLIANT) nonCompliantCount++;
      if (r.nextDueAt && r.nextDueAt < to && r.status !== ComplianceStatus.COMPLIANT) {
        overdueCount++;
      }
    }
    const complianceRate =
      complianceRecords.length > 0
        ? Math.round((compliantCount / complianceRecords.length) * 1000) / 10
        : 100.0;

    // Aggregated Violations
    const [currentViolations, priorViolations] = await Promise.all([
      this.prisma.violation.findMany({
        where: {
          mineId: { in: targetMineIds },
          raisedAt: { gte: from, lte: to },
        },
        include: { mine: true, complianceRequirement: true },
      }),
      this.prisma.violation.findMany({
        where: {
          mineId: { in: targetMineIds },
          raisedAt: { gte: priorFrom, lte: priorTo },
        },
      }),
    ]);

    // Top At-Risk Mines Ranking
    const mineRiskMap: Record<
      string,
      { mineId: string; mineName: string; mineCode: string; criticalViolations: number; overdueCompliance: number; overdueCapas: number; riskScore: number }
    > = {};

    for (const m of company.mines.filter((m) => targetMineIds.includes(m.id))) {
      mineRiskMap[m.id] = {
        mineId: m.id,
        mineName: m.name,
        mineCode: m.code,
        criticalViolations: 0,
        overdueCompliance: 0,
        overdueCapas: 0,
        riskScore: 0,
      };
    }

    currentViolations
      .filter((v) => v.severity === 'CRITICAL' && v.status !== ViolationStatus.RESOLVED)
      .forEach((v) => {
        if (mineRiskMap[v.mineId]) mineRiskMap[v.mineId].criticalViolations++;
      });

    complianceRecords
      .filter((r) => r.nextDueAt && r.nextDueAt < to && r.status !== ComplianceStatus.COMPLIANT)
      .forEach((r) => {
        if (mineRiskMap[r.mineId]) mineRiskMap[r.mineId].overdueCompliance++;
      });

    const companyCapas = await this.prisma.correctiveAction.findMany({
      where: {
        violation: { mineId: { in: targetMineIds } },
        status: { not: CapaStatus.CLOSED },
        dueAt: { lt: to },
      },
      include: { violation: true },
    });

    companyCapas.forEach((c) => {
      if (mineRiskMap[c.violation.mineId]) {
        mineRiskMap[c.violation.mineId].overdueCapas++;
      }
    });

    // Compute composite risk score: (Critical * 3) + (Overdue Comp * 2) + (Overdue CAPA * 1)
    const topAtRiskMines = Object.values(mineRiskMap)
      .map((item) => ({
        ...item,
        riskScore: item.criticalViolations * 3 + item.overdueCompliance * 2 + item.overdueCapas,
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    const severityDistribution = {
      CRITICAL: currentViolations.filter((v) => v.severity === 'CRITICAL').length,
      HIGH: currentViolations.filter((v) => v.severity === 'HIGH').length,
      MEDIUM: currentViolations.filter((v) => v.severity === 'MEDIUM').length,
      LOW: currentViolations.filter((v) => v.severity === 'LOW').length,
    };

    const categoryDistribution: Record<string, number> = {
      SAFETY: 0,
      ENVIRONMENT: 0,
      LABOUR: 0,
      PRODUCTION: 0,
    };
    for (const v of currentViolations) {
      const cat = v.complianceRequirement?.category || 'SAFETY';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    }

    const currentInspections = await this.prisma.inspection.findMany({
      where: {
        mineId: { in: targetMineIds },
        scheduledFor: { gte: from, lte: to },
      },
    });

    const trends = this.buildTimeSeriesTrend(currentViolations, currentInspections, from, to);

    return {
      company: { id: company.id, name: company.name, code: company.code },
      totalMines: company.mines.length,
      monitoredMines: targetMineIds.length,
      window: { from, to, priorFrom, priorTo },
      kpis: {
        complianceRate,
        totalRecords: complianceRecords.length,
        compliantRecords: compliantCount,
        nonCompliantRecords: nonCompliantCount,
        overdueRecords: overdueCount,
        violations: {
          current: currentViolations.length,
          prior: priorViolations.length,
          percentChange: this.calculatePercentChange(
            currentViolations.length,
            priorViolations.length,
          ),
          criticalCount: severityDistribution.CRITICAL,
        },
        overdueCapasCount: companyCapas.length,
      },
      topAtRiskMines,
      distributions: {
        severity: severityDistribution,
        category: categoryDistribution,
      },
      trends,
    };
  }

  /**
   * 3. Regulator-Level Statutory Overview Dashboard
   */
  async getRegulatorOverview(query: QueryDashboardDto, user: RequestUser) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.REGULATOR) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only DGMS Regulators and Administrators can access national regulator dashboards',
      });
    }

    const { from, to, priorFrom, priorTo } = this.resolveDateWindows(query);

    const companies = await this.prisma.company.findMany({
      where: query.companyId ? { id: query.companyId } : {},
      include: {
        mines: {
          where: query.mineId ? { id: query.mineId } : { status: 'ACTIVE' },
        },
      },
    });

    const allMineIds = companies.flatMap((c) => c.mines.map((m) => m.id));

    // Fetch all compliance records and violations nationwide
    const [allCompliance, allViolations, allOverdueCapas] = await Promise.all([
      this.prisma.complianceRecord.findMany({
        where: { mineId: { in: allMineIds } },
        include: { mine: true },
      }),
      this.prisma.violation.findMany({
        where: {
          mineId: { in: allMineIds },
          raisedAt: { gte: from, lte: to },
        },
        include: { mine: { include: { company: true } }, complianceRequirement: true },
      }),
      this.prisma.correctiveAction.findMany({
        where: {
          violation: { mineId: { in: allMineIds } },
          status: { not: CapaStatus.CLOSED },
          dueAt: { lt: to },
        },
        include: { violation: true },
      }),
    ]);

    // Subsidiary Comparisons
    const subsidiaryHealth = companies.map((c) => {
      const cMineIds = c.mines.map((m) => m.id);
      const cComp = allCompliance.filter((r) => cMineIds.includes(r.mineId));
      const cViol = allViolations.filter((v) => cMineIds.includes(v.mineId));
      const cOverdueCapas = allOverdueCapas.filter((ca) =>
        cMineIds.includes(ca.violation.mineId),
      );

      const compliant = cComp.filter((r) => r.status === ComplianceStatus.COMPLIANT).length;
      const rate =
        cComp.length > 0
          ? Math.round((compliant / cComp.length) * 1000) / 10
          : 100.0;

      return {
        companyId: c.id,
        name: c.name,
        code: c.code,
        totalMines: c.mines.length,
        complianceRate: rate,
        violationsCount: cViol.length,
        criticalViolationsCount: cViol.filter((v) => v.severity === 'CRITICAL').length,
        overdueCapasCount: cOverdueCapas.length,
      };
    });

    const severityDistribution = {
      CRITICAL: allViolations.filter((v) => v.severity === 'CRITICAL').length,
      HIGH: allViolations.filter((v) => v.severity === 'HIGH').length,
      MEDIUM: allViolations.filter((v) => v.severity === 'MEDIUM').length,
      LOW: allViolations.filter((v) => v.severity === 'LOW').length,
    };

    const categoryDistribution: Record<string, number> = {
      SAFETY: 0,
      ENVIRONMENT: 0,
      LABOUR: 0,
      PRODUCTION: 0,
    };
    for (const v of allViolations) {
      const cat = v.complianceRequirement?.category || 'SAFETY';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    }

    return {
      jurisdiction: 'DGMS Statutory Coal Mining Oversight (National)',
      window: { from, to, priorFrom, priorTo },
      totalCompanies: companies.length,
      totalMines: allMineIds.length,
      totalViolations: allViolations.length,
      totalOverdueCapas: allOverdueCapas.length,
      subsidiaryComparisons: subsidiaryHealth,
      distributions: {
        severity: severityDistribution,
        category: categoryDistribution,
      },
    };
  }

  /**
   * Helper: Generate uniform daily time-series buckets.
   */
  private buildTimeSeriesTrend(
    violations: any[],
    inspections: any[],
    from: Date,
    to: Date,
  ) {
    const buckets: Record<
      string,
      { date: string; violationsOpened: number; inspectionsConducted: number }
    > = {};

    const cur = new Date(from);
    while (cur <= to) {
      const key = cur.toISOString().split('T')[0];
      buckets[key] = { date: key, violationsOpened: 0, inspectionsConducted: 0 };
      cur.setDate(cur.getDate() + 1);
    }

    for (const v of violations) {
      const d = v.raisedAt.toISOString().split('T')[0];
      if (buckets[d]) buckets[d].violationsOpened++;
    }

    for (const i of inspections) {
      const d = i.scheduledFor.toISOString().split('T')[0];
      if (buckets[d]) buckets[d].inspectionsConducted++;
    }

    return Object.values(buckets);
  }
}
