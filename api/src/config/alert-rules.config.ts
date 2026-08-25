export interface AlertRuleThreshold {
  ruleKey: string;
  resourceType: string;
  stage: number;
  thresholdDays: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  titleTemplate: string;
  description: string;
}

export const ALERT_RULES_CONFIG = {
  version: '1.0.0',
  rules: {
    // ─── Compliance Record Rules ───────────────────────────────────────────
    COMPLIANCE_DUE_14D: {
      ruleKey: 'COMPLIANCE_DUE_14D',
      resourceType: 'ComplianceRecord',
      stage: 1,
      thresholdDays: 14,
      severity: 'INFO',
      titleTemplate: 'Upcoming Compliance Deadline (14 Days)',
      description: 'Statutory compliance return / verification due in 14 days.',
    },
    COMPLIANCE_DUE_7D: {
      ruleKey: 'COMPLIANCE_DUE_7D',
      resourceType: 'ComplianceRecord',
      stage: 2,
      thresholdDays: 7,
      severity: 'WARNING',
      titleTemplate: 'Urgent Compliance Deadline (7 Days)',
      description: 'Statutory compliance return / verification due in 7 days.',
    },
    COMPLIANCE_OVERDUE: {
      ruleKey: 'COMPLIANCE_OVERDUE',
      resourceType: 'ComplianceRecord',
      stage: 3,
      thresholdDays: 0,
      severity: 'CRITICAL',
      titleTemplate: 'Statutory Compliance Return OVERDUE',
      description: 'Compliance deadline has passed without verification. Escalated to Corporate & DGMS.',
    },

    // ─── Corrective Action (CAPA) Rules ────────────────────────────────────
    CAPA_DUE_3D: {
      ruleKey: 'CAPA_DUE_3D',
      resourceType: 'CorrectiveAction',
      stage: 1,
      thresholdDays: 3,
      severity: 'INFO',
      titleTemplate: 'CAPA Remediation Due in 3 Days',
      description: 'Corrective action is due for closure in 3 days.',
    },
    CAPA_DUE_1D: {
      ruleKey: 'CAPA_DUE_1D',
      resourceType: 'CorrectiveAction',
      stage: 2,
      thresholdDays: 1,
      severity: 'WARNING',
      titleTemplate: 'URGENT: CAPA Remediation Due Tomorrow',
      description: 'Corrective action deadline is in 24 hours.',
    },
    CAPA_OVERDUE_STAGE_1: {
      ruleKey: 'CAPA_OVERDUE_STAGE_1',
      resourceType: 'CorrectiveAction',
      stage: 1,
      thresholdDays: 0,
      severity: 'WARNING',
      titleTemplate: 'CAPA Action OVERDUE — Stage 1 Escalation',
      description: 'Corrective action has breached target completion date. Escalated to Mine Official.',
    },
    CAPA_OVERDUE_STAGE_2: {
      ruleKey: 'CAPA_OVERDUE_STAGE_2',
      resourceType: 'CorrectiveAction',
      stage: 2,
      thresholdDays: -3, // 3+ days overdue
      severity: 'CRITICAL',
      titleTemplate: 'CAPA Action OVERDUE — Stage 2 High Escalation',
      description: 'Critical corrective action is 3+ days overdue. Escalated to Corporate Management & DGMS Regulator.',
    },

    // ─── Violation Domain Event Rules ──────────────────────────────────────
    VIOLATION_RAISED: {
      ruleKey: 'VIOLATION_RAISED',
      resourceType: 'Violation',
      stage: 1,
      thresholdDays: 0,
      severity: 'CRITICAL',
      titleTemplate: 'Formal Statutory Violation Raised',
      description: 'A formal safety or environmental statutory violation has been logged.',
    },
  },
};
