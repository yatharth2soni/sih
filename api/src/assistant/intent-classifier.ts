export enum AssistantIntent {
  COMPLIANCE_STATUS = 'COMPLIANCE_STATUS',
  OVERDUE_CAPA = 'OVERDUE_CAPA',
  RECENT_VIOLATIONS = 'RECENT_VIOLATIONS',
  MINE_RISK = 'MINE_RISK',
  GRIEVANCE_SUMMARY = 'GRIEVANCE_SUMMARY',
  HELP_CAPABILITIES = 'HELP_CAPABILITIES',
  UNKNOWN = 'UNKNOWN',
}

export interface IntentMatch {
  intent: AssistantIntent;
  confidence: number;
  detectedLanguage: 'en' | 'hi';
}

/**
 * Detects whether the input text uses Devanagari script (Hindi) or Latin script (English).
 */
export function detectLanguage(text: string, explicitLanguage?: string): 'en' | 'hi' {
  if (explicitLanguage === 'hi' || explicitLanguage === 'en') {
    return explicitLanguage;
  }
  // Check for Devanagari Unicode range: \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  return hasDevanagari ? 'hi' : 'en';
}

/**
 * Keyword and regex rules for allowlisted governance intents in English and Hindi.
 */
const INTENT_RULES: Array<{
  intent: AssistantIntent;
  keywords: string[];
  patterns: RegExp[];
}> = [
  {
    intent: AssistantIntent.HELP_CAPABILITIES,
    keywords: [
      'help',
      'capabilities',
      'what can you do',
      'commands',
      'who are you',
      'मदद',
      'सहायता',
      'आप क्या कर सकते हैं',
      'क्षमताएं',
    ],
    patterns: [
      /\b(help|capabilities|what\s+can\s+you\s+do|commands)\b/i,
      /(मदद|सहायता|क्षमता|क्या\s+कर\s+सकते)/,
    ],
  },
  {
    intent: AssistantIntent.MINE_RISK,
    keywords: [
      'risk',
      'risk score',
      'hazard score',
      'anomaly',
      'spike',
      'safety index',
      'safe',
      'critical risk',
      'जोखिम',
      'सुरक्षा स्कोर',
      'खतरा',
      'असामान्यता',
      'स्कोर',
      'खतरे का स्तर',
    ],
    patterns: [
      /\b(risk|hazard|risk\s+score|anomaly|anomalies|safety\s+score)\b/i,
      /(जोखिम|खतरे|सुरक्षा\s*स्कोर|असामान्यता|स्कोर)/,
    ],
  },
  {
    intent: AssistantIntent.OVERDUE_CAPA,
    keywords: [
      'capa',
      'corrective action',
      'corrective actions',
      'overdue capa',
      'remedial',
      'remedial action',
      'action plan',
      'कापा',
      'सुधारात्मक कार्रवाई',
      'लंबित कापा',
      'उपाय',
      'कार्य योजना',
    ],
    patterns: [
      /\b(capa|corrective\s+action|corrective\s+actions|remedial)\b/i,
      /(कापा|सुधारात्मक\s*कार्रवाई|सुधारात्मक\s*उपाय)/,
    ],
  },
  {
    intent: AssistantIntent.RECENT_VIOLATIONS,
    keywords: [
      'violation',
      'violations',
      'infraction',
      'breach',
      'open violations',
      'severe violation',
      'उल्लंघन',
      'सुरक्षा उल्लंघन',
      'नियम उल्लंघन',
      'गंभीर मामले',
    ],
    patterns: [
      /\b(violation|violations|infraction|breach)\b/i,
      /(उल्लंघन|उल्लंघनों|नियम\s*तोड़ा)/,
    ],
  },
  {
    intent: AssistantIntent.GRIEVANCE_SUMMARY,
    keywords: [
      'grievance',
      'grievances',
      'complaint',
      'complaints',
      'dispute',
      'sla',
      'worker complaint',
      'open grievance',
      'शिकायत',
      'शिकायतें',
      'विवाद',
      'मजदूर शिकायत',
      'समाधान',
      'लंबित शिकायतें',
    ],
    patterns: [
      /\b(grievance|grievances|complaint|complaints|dispute|sla)\b/i,
      /(शिकायत|शिकायतों|विवाद|समाधान)/,
    ],
  },
  {
    intent: AssistantIntent.COMPLIANCE_STATUS,
    keywords: [
      'compliance',
      'compliant',
      'non-compliant',
      'statutory',
      'rules',
      'regulations',
      'standards',
      'form iv',
      'form iv-b',
      'cmr',
      'अनुपालन',
      'नियम',
      'मानक',
      'सहमति',
      'समीक्षा',
      'वैधानिक',
    ],
    patterns: [
      /\b(compliance|compliant|non-compliant|statutory|regulation|regulations|standards)\b/i,
      /(अनुपालन|नियम|मानक|वैधानिक|समीक्षा)/,
    ],
  },
];

/**
 * Classifies a user query string into an allowlisted Intent with confidence.
 */
export function classifyIntent(
  text: string,
  explicitLanguage?: string,
): IntentMatch {
  const detectedLanguage = detectLanguage(text, explicitLanguage);
  const normalized = text.toLowerCase();

  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        return {
          intent: rule.intent,
          confidence: 0.95,
          detectedLanguage,
        };
      }
    }

    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return {
          intent: rule.intent,
          confidence: 0.85,
          detectedLanguage,
        };
      }
    }
  }

  return {
    intent: AssistantIntent.UNKNOWN,
    confidence: 0.2,
    detectedLanguage,
  };
}
