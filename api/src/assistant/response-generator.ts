import { AssistantIntent } from './intent-classifier';

export interface AssistantCitation {
  resourceType: string;
  resourceId?: string;
  label: string;
}

export interface FormattedResponse {
  answer: string;
  language: 'en' | 'hi';
  intent: AssistantIntent;
  dataAsOf: string;
  citations: AssistantCitation[];
  limitations: string[];
  disclaimer: string;
  provider: string;
}

export const STATUTORY_DISCLAIMER_EN =
  'Informational governance summary only; does not replace statutory regulatory reporting, official certification, or legal compliance orders under the Mines Act 1952 / CMR 2017.';

export const STATUTORY_DISCLAIMER_HI =
  'यह केवल सूचनात्मक शासन सारांश है; यह खान अधिनियम 1952 / सीएमआर 2017 के तहत वैधानिक विनियामक रिपोर्टिंग या आधिकारिक प्रमाणीकरण का स्थान नहीं लेता है।';

export class ResponseGenerator {
  /**
   * Generates bilingual structured response for MINE_RISK intent.
   */
  static formatMineRisk(data: any, lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    const mineName = data.mine?.name || (isHi ? 'निर्दिष्ट खदान' : 'Specified Mine');
    const score = data.riskScore ? data.riskScore.score : 0;
    const band = data.riskScore ? (data.riskScore.band || data.riskScore.riskBand || 'LOW') : 'LOW';
    const anomaliesCount = data.anomaliesCount || 0;

    let answer = '';
    if (isHi) {
      answer = `**${mineName}** का वर्तमान सुरक्षा जोखिम स्कोर **${score} / 100** (${band}) है। ` +
        (anomaliesCount > 0
          ? `वर्तमान में **${anomaliesCount} सक्रिय असामान्यता ध्वज (Anomaly Flags)** दर्ज किए गए हैं जिन पर तत्काल ध्यान देने की आवश्यकता है।`
          : `वर्तमान में कोई सक्रिय असामान्यता ध्वज दर्ज नहीं है। खदान सामान्य सुरक्षा सीमा के भीतर संचालित हो रही है।`);
    } else {
      answer = `**${mineName}** currently has a safety Risk Score of **${score} / 100** (${band}). ` +
        (anomaliesCount > 0
          ? `There are **${anomaliesCount} active anomaly flag(s)** detected requiring management attention.`
          : `No active anomaly flags are detected. The mine is operating within normal risk parameters.`);
    }

    const citations: AssistantCitation[] = [];
    if (data.mine?.id) {
      citations.push({
        resourceType: 'Mine',
        resourceId: data.mine.id,
        label: `${data.mine.name} (${data.mine.code})`,
      });
    }
    if (data.riskScore?.id) {
      citations.push({
        resourceType: 'RiskScore',
        resourceId: data.riskScore.id,
        label: `Risk Score: ${score} (${band}) [v${data.riskScore.calculationVersion || data.riskScore.modelConfigVersion || '1.0.0'}]`,
      });
    }

    return {
      answer,
      language: lang,
      intent: AssistantIntent.MINE_RISK,
      dataAsOf: new Date().toISOString(),
      citations,
      limitations: [
        isHi
          ? 'जोखिम स्कोर पिछले 30/90 दिनों के उल्लंघनों, खुले कापा और शिकायतों के भारित योग पर आधारित है।'
          : 'Risk score is calculated deterministically based on rolling 30/90 day weighted violations, open CAPAs, and grievances.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates bilingual structured response for COMPLIANCE_STATUS intent.
   */
  static formatComplianceStatus(data: any, lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    const total = data.total || 0;
    const compliant = data.compliant || 0;
    const nonCompliant = data.nonCompliant || 0;
    const overdue = data.overdue || 0;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 100;

    let answer = '';
    if (isHi) {
      answer = `वैधानिक अनुपालन समीक्षा: कुल **${total}** अनिवार्य आवश्यकताओं में से **${compliant}** पूर्ण अनुपालन में हैं (**${rate}% अनुपालन दर**)। ` +
        (overdue > 0 || nonCompliant > 0
          ? `वर्तमान में **${overdue}** आवश्यकताएं समय-सीमा पार (Overdue) हैं और **${nonCompliant}** गैर-अनुपालन में हैं।`
          : `सभी वैधानिक अनुपालन आवश्यकताएं समय पर पूर्ण हैं।`);
    } else {
      answer = `Statutory Compliance Review: Out of **${total}** total tracked statutory requirements, **${compliant}** are compliant (**${rate}% overall compliance rate**). ` +
        (overdue > 0 || nonCompliant > 0
          ? `There are currently **${overdue} overdue requirement(s)** and **${nonCompliant} non-compliant record(s)**.`
          : `All statutory compliance requirements are up to date.`);
    }

    const citations: AssistantCitation[] = [
      {
        resourceType: 'ComplianceSummary',
        label: `Compliance Rate: ${rate}% (${compliant}/${total} Compliant, ${overdue} Overdue)`,
      },
    ];

    return {
      answer,
      language: lang,
      intent: AssistantIntent.COMPLIANCE_STATUS,
      dataAsOf: new Date().toISOString(),
      citations,
      limitations: [
        isHi
          ? 'डेटा केवल उपयोगकर्ता के अधिकृत कंपनी/खदान अधिकार क्षेत्र तक सीमित है।'
          : 'Data reflects currently scheduled statutory returns and approvals in the authorized scope.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates bilingual structured response for OVERDUE_CAPA intent.
   */
  static formatOverdueCapa(data: any, lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    const capas = data.capas || [];
    const totalOverdue = capas.length;

    let answer = '';
    if (isHi) {
      if (totalOverdue === 0) {
        answer = `आपके अधिकार क्षेत्र में वर्तमान में कोई लंबित या समय-सीमा पार (Overdue) सुधारात्मक कार्रवाई (CAPA) नहीं है।`;
      } else {
        answer = `वर्तमान में **${totalOverdue} समय-सीमा पार सुधारात्मक कार्रवाई (CAPA)** दर्ज हैं जिन पर तत्काल कार्रवाई आवश्यक है:\n` +
          capas
            .slice(0, 5)
            .map((c: any, i: number) => `${i + 1}. **${c.title || 'सुधारात्मक कार्रवाई'}** (स्थिति: ${c.status})`)
            .join('\n');
      }
    } else {
      if (totalOverdue === 0) {
        answer = `There are currently no overdue Corrective and Preventive Actions (CAPAs) within your authorized scope.`;
      } else {
        answer = `There are currently **${totalOverdue} overdue Corrective Action(s) (CAPA)** requiring closure:\n` +
          capas
            .slice(0, 5)
            .map((c: any, i: number) => `${i + 1}. **${c.title || 'CAPA'}** (Status: ${c.status})`)
            .join('\n');
      }
    }

    const citations: AssistantCitation[] = capas.slice(0, 5).map((c: any) => ({
      resourceType: 'CorrectiveAction',
      resourceId: c.id,
      label: `CAPA: ${c.title}`,
    }));

    return {
      answer,
      language: lang,
      intent: AssistantIntent.OVERDUE_CAPA,
      dataAsOf: new Date().toISOString(),
      citations,
      limitations: [
        isHi
          ? 'केवल अधिकृत खदानों के खुले और समय-सीमा पार कापा प्रदर्शित हैं।'
          : 'Includes open and overdue CAPAs scoped strictly to your accessible mines.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates bilingual structured response for RECENT_VIOLATIONS intent.
   */
  static formatRecentViolations(data: any, lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    const violations = data.violations || [];
    const openCount = violations.length;

    let answer = '';
    if (isHi) {
      if (openCount === 0) {
        answer = `आपके अधिकार क्षेत्र में वर्तमान में कोई खुला सुरक्षा उल्लंघन दर्ज नहीं है।`;
      } else {
        answer = `वर्तमान में **${openCount} सक्रिय सुरक्षा उल्लंघन** दर्ज हैं:\n` +
          violations
            .slice(0, 5)
            .map((v: any, i: number) => `${i + 1}. **${v.title || 'उल्लंघन'}** (गंभीरता: ${v.severity}, स्थिति: ${v.status})`)
            .join('\n');
      }
    } else {
      if (openCount === 0) {
        answer = `There are currently no active safety violations recorded in your authorized scope.`;
      } else {
        answer = `There are currently **${openCount} active safety violation(s)** recorded:\n` +
          violations
            .slice(0, 5)
            .map((v: any, i: number) => `${i + 1}. **${v.title || 'Violation'}** (Severity: ${v.severity}, Status: ${v.status})`)
            .join('\n');
      }
    }

    const citations: AssistantCitation[] = violations.slice(0, 5).map((v: any) => ({
      resourceType: 'Violation',
      resourceId: v.id,
      label: `Violation: ${v.title} (${v.severity})`,
    }));

    return {
      answer,
      language: lang,
      intent: AssistantIntent.RECENT_VIOLATIONS,
      dataAsOf: new Date().toISOString(),
      citations,
      limitations: [
        isHi
          ? 'केवल अधिकृत कार्यक्षेत्र के निरीक्षणों से उत्पन्न उल्लंघन सम्मिलित हैं।'
          : 'Reflects violations recorded from formal inspections within your scope.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates bilingual structured response for GRIEVANCE_SUMMARY intent.
   */
  static formatGrievanceSummary(data: any, lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    const total = data.total || 0;
    const open = data.open || 0;
    const inProgress = data.inProgress || 0;
    const resolved = data.resolved || 0;
    const escalated = data.escalated || 0;

    let answer = '';
    if (isHi) {
      answer = `शिकायत निवारण सारांश: कुल **${total}** दर्ज शिकायतों में से **${open}** खुली हैं, **${inProgress}** प्रगति पर हैं, **${escalated}** उच्च स्तर पर अग्रेषित (Escalated) हैं, और **${resolved}** सफलतापूर्वक हल की जा चुकी हैं।`;
    } else {
      answer = `Grievance Redressal Summary: Out of **${total}** total grievances, **${open}** are open, **${inProgress}** in progress, **${escalated}** escalated, and **${resolved}** resolved.`;
    }

    const citations: AssistantCitation[] = [
      {
        resourceType: 'GrievanceSummary',
        label: `Grievances: ${open} Open, ${escalated} Escalated, ${resolved} Resolved (Total: ${total})`,
      },
    ];

    return {
      answer,
      language: lang,
      intent: AssistantIntent.GRIEVANCE_SUMMARY,
      dataAsOf: new Date().toISOString(),
      citations,
      limitations: [
        isHi
          ? 'गोपनीयता नीति के तहत केवल समग्र आँकड़े प्रदर्शित हैं; व्यक्तिगत शिकायत विवरण नहीं।'
          : 'Confidentiality policy enforces aggregate counts only; personal complaint narratives are omitted.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates Help & Capabilities response.
   */
  static formatHelp(lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    let answer = '';
    if (isHi) {
      answer = `**खनन सुरक्षा शासन सहायक (Khanan Suraksha Assistant)** में आपका स्वागत है। मैं निम्नलिखित विषयों पर अधिकृत डेटा सारांश प्रदान कर सकता हूँ:\n` +
        `1. **सुरक्षा जोखिम स्कोर**: *"झरिया खदान का जोखिम स्कोर क्या है?"*\n` +
        `2. **वैधानिक अनुपालन**: *"अनुपालन स्थिति क्या है?"*\n` +
        `3. **लंबित कापा (CAPA)**: *"लंबित सुधारात्मक कार्रवाइयाँ बताएं"*\n` +
        `4. **सुरक्षा उल्लंघन**: *"सक्रिय सुरक्षा उल्लंघनों की सूची दें"*\n` +
        `5. **शिकायत निवारण**: *"शिकायत सारांश क्या है?"*`;
    } else {
      answer = `Welcome to the **Khanan Suraksha Governance Assistant**. I can provide scoped data summaries for the following governance domains:\n` +
        `1. **Mine Safety Risk Scores**: *"What is the risk score for Jharia Block-4?"*\n` +
        `2. **Statutory Compliance Status**: *"What is our overall compliance status?"*\n` +
        `3. **Overdue CAPAs**: *"Show me overdue corrective actions"*\n` +
        `4. **Active Violations**: *"List recent open violations"*\n` +
        `5. **Grievances Summary**: *"What is the status of worker grievances?"*`;
    }

    return {
      answer,
      language: lang,
      intent: AssistantIntent.HELP_CAPABILITIES,
      dataAsOf: new Date().toISOString(),
      citations: [],
      limitations: [],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }

  /**
   * Generates Unknown Intent fallback response.
   */
  static formatUnknown(lang: 'en' | 'hi'): FormattedResponse {
    const isHi = lang === 'hi';
    let answer = '';
    if (isHi) {
      answer = `क्षमा करें, मैं आपके प्रश्न को एक विशिष्ट शासन कार्यक्षेत्र में वर्गीकृत नहीं कर सका। कृपया सुरक्षा जोखिम, वैधानिक अनुपालन, लंबित कापा, सुरक्षा उल्लंघन, या शिकायतों से संबंधित प्रश्न पूछें (उदा. *"झरिया खदान का जोखिम स्कोर बताएं"*).`;
    } else {
      answer = `I could not map your query to a supported governance intent. Please ask about safety risk scores, compliance status, overdue CAPAs, recent violations, or grievance summaries (e.g. *"What is the risk score for Jharia Block-4?"*).`;
    }

    return {
      answer,
      language: lang,
      intent: AssistantIntent.UNKNOWN,
      dataAsOf: new Date().toISOString(),
      citations: [],
      limitations: [
        isHi
          ? 'सुरक्षा नीति के तहत मनमाने डेटाबेस प्रश्न समर्थित नहीं हैं।'
          : 'Arbitrary natural language SQL generation is disabled under platform security policy.',
      ],
      disclaimer: isHi ? STATUTORY_DISCLAIMER_HI : STATUTORY_DISCLAIMER_EN,
      provider: 'deterministic',
    };
  }
}
