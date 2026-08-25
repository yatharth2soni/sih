export const RISK_SCORING_CONFIG = {
  version: '1.0.0',
  windowDays: 30,
  baselineWindowDays: 30, // Days 31-60 before now
  weights: {
    violations: 0.35,     // 35% weight
    capas: 0.25,          // 25% weight
    compliance: 0.25,     // 25% weight
    inspectionGap: 0.15,  // 15% weight
  },
  pointScale: {
    violations: {
      CRITICAL: 25,
      HIGH: 15,
      MEDIUM: 8,
      LOW: 3,
      maxPointsDenominator: 50, // 50 raw points = 100% normalized factor score
    },
    capas: {
      overdue: 20,
      openOrInProgress: 5,
      maxPointsDenominator: 40, // 40 raw points = 100% normalized factor score
    },
    compliance: {
      NON_COMPLIANT: 25,
      OVERDUE: 15,
      PENDING: 5,
      maxPointsDenominator: 50, // 50 raw points = 100% normalized factor score
    },
    inspectionGap: {
      noInspectionsPoints: 100,
    },
  },
  bands: {
    LOW: { min: 0, max: 25, label: 'LOW' },
    MEDIUM: { min: 26, max: 50, label: 'MEDIUM' },
    HIGH: { min: 51, max: 75, label: 'HIGH' },
    CRITICAL: { min: 76, max: 100, label: 'CRITICAL' },
  },
  anomalyThresholds: {
    violationSpike: {
      minCurrentViolations: 2,
      minAbsoluteIncrease: 2,
      relativeSurgeMultiplier: 2.0, // 2x baseline
    },
    overdueCapaCluster: {
      minOverdueCapas: 3,
    },
    recurringNonCompliance: {
      minNonCompliantRecords: 2,
    },
  },
};
