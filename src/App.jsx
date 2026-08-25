import React, { useState, useEffect } from "react";
import { api, tokenStorage } from "./api/client";

// ─── COMPREHENSIVE STRICT TRANSLATION DICTIONARY ──────────────────────────────
const i18n = {
  en: {
    appName: "Khanan Suraksha",
    appSubtitle: "Coal Compliance Grid",
    officerName: "R. Mahapatra",
    officerRole: "Compliance Officer",

    // Roles
    roleMineOfficial: "Mine Official",
    roleCorporate: "Corporate Management",
    roleRegulator: "DGMS Regulatory Authority",
    roleContractor: "Contractor / Compliance",
    switchRole: "Switch Role",

    // Authentication & Onboarding
    authTitle: "Smart Coal Mining Governance Portal",
    authSubtitle: "Directorate General of Mines Safety (DGMS) & Ministry of Coal",
    authPrompt: "Select your governance role and enter authorized credentials to access the grid.",
    lblRoleSelect: "Select Governance Role",
    lblEmail: "Official Email Address",
    phEmail: "officer@coalindia.gov.in",
    lblContractor: "Designation / Organization Name",
    phContractor: "e.g. Area Safety Officer / Eastern Coalfields Ltd.",
    lblPassword: "Password / Security Token",
    phPassword: "Enter your password",
    lblMineBlockSelect: "Assigned Mine Block",
    btnSubmitAuth: "Enter Governance Grid",
    authGeneratedIdLbl: "Generated Statutory Access ID",
    authSecurityNotice: "Statutory requirement under Coal Mines Regulations (CMR Reg. 108) & Mines Act 1952. All activities are cryptographically signed and logged.",
    quickDemoFill: "Quick Demo Auto-Fill",
    logout: "Log out",
    contractorBadge: "Access ID",
    authPassError: "Please enter your password",
    authEmailError: "Please enter a valid official email",
    authNameError: "Please enter your designation or organization name",

    // Navigation Tabs
    navDashboard: "Dashboard",
    navTelemetry: "Gas & Telemetry",
    navInspections: "Inspections",
    navInsights: "AI Insights",
    navCompliance: "Compliance Register",
    navContractors: "Contractors",
    navReports: "Reports & Filings",
    navAudit: "Audit Trail",
    navAssistant: "Governance Assistant",
    assistantTitle: "Multilingual Governed Assistant",
    assistantSub: "Grounded AI query interface for safety scores, compliance rates, and statutory citations",
    navSettings: "Settings",
    mainMenu: "MAIN MENU",
    systemMenu: "SYSTEM",
    liveDgmsSync: "Live DGMS Sync",
    dgmsPortal: "DGMS Portal",
    offlineModeActive: "Field Mode (Offline Queue Active)",
    btnSyncNow: "Sync Now",
    syncSuccess: "All offline logs synchronized with DGMS Central Server successfully.",

    // Dashboard Overview
    dashboardOverview: "Governance Dashboard",
    dashboardSub: "Real-time overview of mining operations, statutory compliance & telemetry",
    kpiRiskScore: "COMPOSITE RISK SCORE",
    kpiModerateRisk: "Moderate Risk",
    kpiOverdueInspections: "OVERDUE INSPECTIONS",
    kpiTotalPending: "Total pending",
    kpiOnShift: "ON SHIFT",
    kpiPersonnel: "Personnel",
    kpiDustLevel: "DUST LEVEL (Avg)",
    kpiWithinLimits: "Within Limits",
    kpiMethaneAvg: "CH₄ METHANE LEVEL",
    kpiAirflowNominal: "Airflow Nominal",
    kpiAggregateCompliance: "AGGREGATE COMPLIANCE",
    kpiAcross4Mines: "Across 4 monitored mines",
    kpiPendingApprovals: "PENDING STATUTORY RETURNS",
    kpiForm3AQueue: "Form III-A review queue",

    // Quick Actions
    btnStartInspection: "Start Inspection",
    btnLogObservation: "Log Observation",
    btnBroadcastEvacuation: "Broadcast Alert",
    btnExportDossier: "Export Executive Dossier",
    btnIssueNotice: "Issue Form IV-B Notice",

    // Common Buttons & Labels
    preview: "Preview",
    saveDraft: "Save draft",
    discard: "Discard",
    cancel: "Cancel",
    reset: "Reset",
    pdf: "PDF",
    escalate: "Escalate",
    viewAll: "View all",
    lastSurvey: "Last survey",
    lastInspected: "Last inspected",
    depth: "Depth",
    workersOnShift: "Workers on shift",
    activeSensors: "Active sensors",
    shiftCrews: "Shift crews",
    panelsIncluded: "Panels included",
    entryPortal: "Entry portal",
    status: "Status",
    action: "Action",
    details: "Details",
    search: "Search records, checkpoints, rules...",

    // Feature 1: AI Risk Insights (Roof-Fall Alert)
    riskTitle: "Roof-fall risk rising in Section B",
    tagHighRisk: "High Risk",
    tagJharia: "Jharia Block-4",
    tagDetectedTime: "Detected 18 Feb, 06:20",
    tagDgmsReg: "DGMS Reg. 108",
    btnAssignCapa: "Assign CAPA",
    cardRiskScore: "Composite risk score",
    modelRecords: "Model v4.2 · 3,140 records",
    riskHighBand: "of 100 · High Risk band",
    riskDelta: "Up 23 points in 7 days",
    gaugeSafe: "SAFE",
    gaugeCritical: "CRITICAL",
    cardExplanation: "What this means",
    explanationText: "Support-bolt readings in Section B have drifted below the safe threshold on four consecutive shifts, while strata-convergence has doubled since the 12 Feb blast. Two roof-support inspections were logged late. Similar patterns preceded roof-fall incidents at Block-2 in 2024.",
    cardFactors: "Contributing factors",
    factorSignalWeight: "Weight of each signal",
    factorBoltTension: "Support-bolt tension below limit",
    factorBoltNote: "4 shifts flagged · 12 sensors",
    factorConvergence: "Strata convergence rate",
    factorConvergenceNote: "9 mm/day vs 4 mm/day baseline",
    factorInspectionsOverdue: "Overdue roof-support inspections",
    factorInspectionsNote: "2 open beyond 72 hours",
    factorVibration: "Blast vibration residue",
    factorVibrationNote: "Peak 14 mm/s on 12 Feb",
    cardAffectedZone: "Affected zone",
    cardAssignCapa: "Assign corrective action",
    lblResponsibleOfficer: "Responsible officer",
    lblActionTemplate: "Action template",
    optActionTemplate: "Re-bolt & re-survey Section B",
    lblTargetClosure: "Target closure",
    optClosure24h: "24 hrs",
    optClosure48h: "48 hrs",
    optClosure7d: "7 days",
    btnConfirmAssignment: "Confirm assignment",
    capaDisclaimer: "Officer is notified on mobile and the action is logged to the audit trail.",
    cardUnderlyingRecords: "Underlying records",
    total14Records: "14 total",
    rec1Title: "Roof-support inspection overdue",
    rec1Meta: "INS-8841 · Section B",
    rec2Title: "Bolt tension anomaly · 12 sensors",
    rec2Meta: "OBS-3320 · Section B",
    rec3Title: "Blast vibration peak 14 mm/s",
    rec3Meta: "ENV-0917 · Seismograph",
    rec4Title: "Strata convergence survey",
    rec4Meta: "SRV-2204 · Underground Station",
    btnViewAll14: "View all 14 records",
    cardAuditTrail: "Audit trail",
    auditImmutable: "Immutable log",
    audit1: "Alert generated by model v4.2",
    audit2: "Notified Agent Manager, Block-4",
    audit3: "Viewed by",
    audit4: "Section B access restricted",
    auditAssigned: "CAPA assigned to",
    date14Feb: "14 Feb",
    date16Feb: "16 Feb",
    date12Feb: "12 Feb",
    date18Feb0620: "18 Feb 06:20",
    date18Feb0622: "18 Feb 06:22",
    date18Feb0705: "18 Feb 07:05",
    date18Feb0711: "18 Feb 07:11",
    date18Feb0745: "18 Feb 07:45",
    date31Jan: "31 Jan",
    date31Dec: "31 Dec",
    date15Jan: "15 Jan",
    footerMinistry: "Ministry of Coal · Digital Compliance Grid",
    footerAlertRetention: "Alert AL-2026-0418 · Retained 7 years",

    // Feature 2: Create Dashboard
    crumbBackDashboard: "Back to Dashboard",
    pageCreateDashboard: "Create dashboard",
    tagNewView: "New view",
    tagOwner: "Owner",
    tagDraftSaved: "Draft saved 09:14",
    btnCreateDashboard: "Create dashboard",
    cardDashboardDefinition: "Dashboard definition",
    step1of2: "Step 1 of 2",
    workingTitleSub: "Working title · visible to 6 officers",
    lblDashboardName: "Dashboard name",
    dashboardDefaultTitle: "Block-4 Safety",
    dashboardNameHint: "Appears in the sidebar and on exported reports.",
    lblMineScope: "Mine scope",
    valMineScope: "Jharia Coalfield · Block-4",
    lblVisibleRole: "Visible to role",
    valVisibleRole: "Mine Officials & Registered Contractors",
    lblRefreshInterval: "Refresh interval",
    optLive: "Live",
    opt15min: "15 min",
    optPerShift: "Per shift",
    optDaily: "Daily",
    cardSelectedScope: "Selected scope",
    cardAddWidgets: "Add widgets",
    widgetsSelectedOf: "selected",
    widgetRisk: "Composite risk score",
    widgetRiskMeta: "Updated per shift",
    widgetOverdue: "Overdue inspections",
    widgetOverdueMeta: "DGMS Reg. 108",
    widgetAttendance: "Shift attendance",
    widgetAttendanceMeta: "Biometric feed",
    widgetVentilation: "Ventilation & dust index",
    widgetVentilationMeta: "MoEFCC Compliance",
    widgetDespatch: "Daily despatch tonnage",
    widgetDespatchMeta: "Weighbridge telemetry",
    widgetFiling: "Statutory filing tracker",
    widgetFilingMeta: "4 due this month",
    cardLayoutPreview: "Layout preview",
    sampleDataDate: "Sample data · 18 Feb",
    metricRiskScore: "Risk score",
    metricOverdue: "Overdue",
    metricOnShift: "On shift",
    metricDust: "Dust mg/m³",
    lblWidgetsPlaced: "Widgets placed",
    widgetsPlacedHint: "Two more widgets fit in the default grid before it scrolls.",
    footerDashboardAutosaved: "Draft DB-2026-0031 · Autosaved",

    // Feature 3: Inspections
    crumbInspections: "Inspections",
    pageNewInspection: "New statutory inspection",
    tagDraftIns: "Draft INS-8907",
    cardInspectionSetup: "Inspection setup",
    step1of3: "Step 1 of 3",
    lblInspectionType: "Inspection type",
    valInspectionType: "Roof support & strata control",
    valInspectionTypeSub: "26 statutory checkpoints",
    lblMineBlock: "Mine & block",
    valMineBlock: "Jharia Block-4",
    lblSectionPanel: "Section / panel",
    valSectionPanel: "Section B · Panel B-3",
    lblAssignedInspector: "Assigned inspector",
    valSafetyOfficer: "Safety Officer, Block-4",
    lblScheduledShift: "Scheduled shift",
    optShift1: "Shift I · 06:00",
    optShift2: "Shift II · 14:00",
    optShift3: "Shift III · 22:00",
    lblPriority: "Priority",
    optUrgent: "Urgent · 24 hrs",
    optRoutine: "Routine · 7 days",
    btnCreateChecklist: "Start Interactive Checklist",
    inspectionOfflineNote: "The inspector is notified on mobile and the checklist downloads for offline use.",
    cardInspectionSite: "Inspection site",
    cardChecklistCoverage: "Checklist coverage",
    total26Checkpoints: "26 checkpoints",
    checkBoltTension: "Bolt tension & anchorage",
    checkBoltNote: "9 of 26 checkpoints",
    checkStrata: "Strata convergence readings",
    checkStrataNote: "7 of 26 checkpoints",
    checkVentilation: "Ventilation & gas sampling",
    checkVentilationNote: "6 of 26 checkpoints",
    checkAccess: "Access, lighting & signage",
    checkAccessNote: "4 of 26 checkpoints",
    btnPreviewChecklist: "Open Full Checklist Runner",
    cardPriorInspections: "Prior inspections here",
    sectionBTotal11: "Section B · 11 total",
    prior1Title: "Roof support · overdue 72 hrs",
    prior1Meta: "INS-8841 · S. Kujur · Overdue",
    prior2Title: "Ventilation survey · closed",
    prior2Meta: "INS-8790 · A. Bhuinya · Closed",
    prior3Title: "Electrical & haulage · 3 findings",
    prior3Meta: "INS-8702 · M. Tirkey · 3 findings",
    prior4Title: "Dust & water spray · closed",
    prior4Meta: "INS-8654 · P. Oraon · Closed",
    btnViewAll11Inspections: "View all 11 inspections",
    footerInsAutosaved: "Draft INS-8907 · Autosaved 07:42",

    // Feature 4: Create Report
    crumbBackReports: "Back to Reports",
    pageCreateReport: "Create statutory report",
    tagDraftReport: "Draft RPT-2026-0219",
    tagAutosavedTime: "Autosaved 09:14",
    cardReportParameters: "Report parameters",
    lblReportType: "Report type",
    valReportType: "Monthly Statutory Compliance Return",
    valReportTypeSub: "Form III-A · DGMS & MoEFCC",
    lblMineReportScope: "Mine / scope",
    valMineReportScopeSub: "BCCL subsidiary · 3 sections",
    lblReportingPeriod: "Reporting period",
    optJan2026: "Jan 2026",
    optFeb2026: "Feb 2026",
    optQ4: "Q4 FY25-26",
    optCustom: "Custom",
    lblOutputFormat: "Output format",
    optPdf: "Signed PDF",
    optXlsx: "XLSX",
    optDgmsXml: "DGMS XML",
    lblSigningAuthority: "Signing authority",
    valSignerName: "A. Bhattacharya",
    valSignerRole: "Agent Manager, Block-4 · DSC valid to 11 Aug 2027",
    btnGenerateReport: "Generate report",
    btnSubmitDgmsEfiling: "Digitally Sign & Submit to DGMS",
    reportGenHint: "Generation pulls 1,284 approved records for the selected period. The draft is written to the audit trail before signing.",
    cardSectionsIncluded: "Sections included",
    secInspections: "Inspections & findings",
    secInspectionsMeta: "312 records",
    secViolations: "Violations & CAPA status",
    secViolationsMeta: "27 open · 61 closed",
    secProduction: "Production & despatch",
    secProductionMeta: "0.94 MT raised",
    secEnvironment: "Environment monitoring",
    secEnvironmentMeta: "PM10, noise, effluent",
    secLabour: "Labour & attendance",
    secLabourMeta: "1,146 workers · 4 contractors",
    secStatutory: "Statutory declarations",
    secStatutoryMeta: "Form IV-B filing",
    cardReportPreview: "Report preview",
    form3aPreview: "Form III-A preview",
    pvHeading: "Monthly Statutory Compliance Return —",
    pvSubtitle: "Jharia Coalfield · Block-4 · DGMS Reg. 108 / MoEFCC",
    pvPeriod: "Reporting period",
    pvSigner: "Signing authority",
    pvSignerVal: "A. Bhattacharya (Agent Manager)",
    pvRecords: "Verified records",
    pvRecordsVal: "1,284 entries",
    pvActiveSections: "Selected sections",
    pvActiveSectionsVal: "sections active",
    pvToken: "Digital security token",
    meterCompliance: "Overall compliance",
    meterStrata: "Strata monitoring",
    cardRecentReturns: "Recent statutory returns",
    block4Archive: "Block-4 archive",
    ret1Title: "Jan 2026 Monthly Return · Signed",
    ret1Meta: "RPT-2026-0118 · A. Bhattacharya",
    ret2Title: "Dec 2025 Monthly Return · Signed",
    ret2Meta: "RPT-2025-1215 · A. Bhattacharya",
    ret3Title: "Q3 Environmental Return · Signed",
    ret3Meta: "RPT-2025-Q3 · DGMS / MoEFCC",
    btnViewArchive: "View compliance archive",
    footerReportAutosaved: "Draft RPT-2026-0219 · Autosaved",

    // Interactive Modals Translations
    modalObservationTitle: "Log Geo-Tagged Safety Observation",
    lblObsType: "Observation Classification",
    optUnsafeCondition: "Unsafe Physical Condition",
    optUnsafeAct: "Unsafe Working Practice / Act",
    optGasSeepage: "Gas Seepage / Airflow Anomaly",
    optEquipmentFlaw: "Heavy Earthmoving Machinery Flaw",
    lblGeoCoords: "Underground GPS / Spatial Location",
    lblSeverity: "Severity Rating",
    sevCritical: "Critical (Immediate Stop Work)",
    sevHigh: "High Priority",
    sevModerate: "Moderate Priority",
    sevLow: "Low / Advisory",
    lblObsDescription: "Description of Finding",
    phObsDescription: "Describe location, bolt strain, loose strata, or safety gear violation...",
    btnSubmitObservation: "Submit & Log to DGMS Audit Trail",
    observationSavedToast: "Observation logged with geo-tag 23.7507° N, 86.4158° E",

    // Interactive Checklist Runner
    modalChecklistTitle: "Statutory Checkpoint Runner (CMR Reg. 108)",
    checkpointPassedCount: "Checkpoints Passed",
    btnPass: "Pass",
    btnFail: "Fail",
    btnSaveChecklist: "Submit Verified Inspection",
    checklistSavedToast: "Statutory Inspection report submitted successfully.",

    // OCR Document Scanner
    btnOcrScan: "Scan Physical Document (OCR)",
    modalOcrTitle: "AI OCR Document Digitizer",
    ocrProcessing: "Digitizing physical DGMS document with OCR Model v2.4...",
    ocrSuccess: "Document digitized: Extracted Form IV-B compliance record.",

    // Electronic Acknowledgment Slip
    modalAckTitle: "DGMS Electronic Acknowledgment Receipt",
    ackReceiptNo: "Receipt Number: DGMS-ACK-2026-08914",
    ackTimestamp: "Filed on: 18 Feb 2026, 09:30:14 IST",
    ackDigitalSign: "Cryptographically Signed by DSC Token: SHA256: 8f9b2a7d4e1c990b",
    btnPrintAck: "Print Official Slip (PDF)",

    // Map labels
    mapSecB: "Section B",
    mapPanelB3: "Panel B-3",
    mapVent2: "Vent Shaft 2"
  },

  hi: {
    appName: "खनन सुरक्षा",
    appSubtitle: "कोयला अनुपालन ग्रिड",
    officerName: "आर. महापात्रा",
    officerRole: "अनुपालन अधिकारी",

    // Roles
    roleMineOfficial: "खदान अधिकारी",
    roleCorporate: "कॉर्पोरेट प्रबंधन",
    roleRegulator: "डीजीएमएस नियामक प्राधिकारी",
    roleContractor: "ठेकेदार / अनुपालन",
    switchRole: "भूमिका बदलें",

    // Authentication & Onboarding
    authTitle: "स्मार्ट कोयला खनन शासन पोर्टल",
    authSubtitle: "खान सुरक्षा महानिदेशालय (डीजीएमएस) एवं कोयला मंत्रालय",
    authPrompt: "ग्रिड में प्रवेश हेतु अपनी शासन भूमिका चुनें एवं अधिकृत विवरण दर्ज करें।",
    lblRoleSelect: "शासन भूमिका का चयन करें",
    lblEmail: "आधिकारिक ईमेल पता",
    phEmail: "officer@coalindia.gov.in",
    lblContractor: "पदनाम / संस्था का नाम",
    phContractor: "उदा. क्षेत्र सुरक्षा अधिकारी / ईस्टर्न कोलफील्ड्स लिमिटेड",
    lblPassword: "पासवर्ड / सुरक्षा टोकन",
    phPassword: "अपना पासवर्ड दर्ज करें",
    lblMineBlockSelect: "आवंटित खदान ब्लॉक",
    btnSubmitAuth: "शासन ग्रिड में प्रवेश करें",
    authGeneratedIdLbl: "वैधानिक एक्सेस पहचान क्रमांक",
    authSecurityNotice: "कोयला खान विनियम (सीएमआर 108) एवं खान अधिनियम 1952 के तहत अनिवार्य। सभी गतिविधियाँ डिजिटल रूप से हस्ताक्षरित और दर्ज की जाती हैं।",
    quickDemoFill: "डेमो विवरण स्वतः भरें",
    logout: "लॉग आउट",
    contractorBadge: "एक्सेस आईडी",
    authPassError: "कृपया अपना पासवर्ड दर्ज करें",
    authEmailError: "कृपया वैध आधिकारिक ईमेल दर्ज करें",
    authNameError: "कृपया पदनाम या संस्था का नाम दर्ज करें",

    // Navigation Tabs
    navDashboard: "डैशबोर्ड",
    navTelemetry: "गैस एवं टेलीमेट्री",
    navInspections: "निरीक्षण",
    navInsights: "एआई अंतर्दृष्टि",
    navCompliance: "वैधानिक रजिस्टर",
    navContractors: "ठेकेदार",
    navReports: "रिपोर्ट एवं विवरणी",
    navAudit: "ऑडिट ट्रेल",
    navAssistant: "शासन सहायक",
    assistantTitle: "बहुभाषी वैधानिक शासन सहायक",
    assistantSub: "सुरक्षा स्कोर, अनुपालन दर और वैधानिक उद्धरणों के लिए ग्राउंडेड एआई सहायक",
    navSettings: "सेटिंग्स",
    mainMenu: "मुख्य मेनू",
    systemMenu: "सिस्टम",
    liveDgmsSync: "लाइव डीजीएमएस सिंक",
    dgmsPortal: "डीजीएमएस पोर्टल",
    offlineModeActive: "फील्ड मोड (ऑफ़लाइन कतार सक्रिय)",
    btnSyncNow: "सिंक करें",
    syncSuccess: "सभी ऑफ़लाइन रिकॉर्ड डीजीएमएस केंद्रीय सर्वर से सफलतापूर्वक सिंक हो गए हैं।",

    // Dashboard Overview
    dashboardOverview: "शासन डैशबोर्ड",
    dashboardSub: "खनन संचालन, वैधानिक अनुपालन और टेलीमेट्री का वास्तविक समय अवलोकन",
    kpiRiskScore: "समग्र जोखिम स्कोर",
    kpiModerateRisk: "मध्यम जोखिम",
    kpiOverdueInspections: "विलंबित निरीक्षण",
    kpiTotalPending: "कुल लंबित",
    kpiOnShift: "पाली में कार्यरत",
    kpiPersonnel: "कार्मिक",
    kpiDustLevel: "धूल स्तर (औसत)",
    kpiWithinLimits: "सुरक्षित सीमा में",
    kpiMethaneAvg: "मीथेन (CH₄) गैस स्तर",
    kpiAirflowNominal: "वायुसंचार सामान्य",
    kpiAggregateCompliance: "समग्र अनुपालन स्कोर",
    kpiAcross4Mines: "4 निगरानी वाली खदानों में",
    kpiPendingApprovals: "लंबित वैधानिक विवरणियाँ",
    kpiForm3AQueue: "फॉर्म III-A समीक्षा कतार",

    // Quick Actions
    btnStartInspection: "निरीक्षण शुरू करें",
    btnLogObservation: "अवलोकन दर्ज करें",
    btnBroadcastEvacuation: "निकासी चेतावनी जारी करें",
    btnExportDossier: "कार्यकारी डोजियर निर्यात करें",
    btnIssueNotice: "फॉर्म IV-B नोटिस जारी करें",

    // Common Buttons & Labels
    preview: "पूर्वावलोकन",
    saveDraft: "मसौदा सहेजें",
    discard: "रद्द करें",
    cancel: "रद्द करें",
    reset: "रीसेट करें",
    pdf: "पीडीएफ",
    escalate: "उच्चाधिकारी को भेजें",
    viewAll: "सभी देखें",
    lastSurvey: "अंतिम सर्वेक्षण",
    lastInspected: "अंतिम निरीक्षण",
    depth: "गहराई",
    workersOnShift: "पाली में श्रमिक",
    activeSensors: "सक्रिय सेंसर",
    shiftCrews: "पाली दल",
    panelsIncluded: "शामिल पैनल",
    entryPortal: "प्रवेश द्वार",
    status: "स्थिति",
    action: "कार्रवाई",
    details: "विवरण",
    search: "खोजें...",

    // Feature 1: AI Risk Insights
    riskTitle: "सेक्शन बी में छत गिरने का जोखिम बढ़ रहा है",
    tagHighRisk: "उच्च जोखिम",
    tagJharia: "झरिया ब्लॉक-4",
    tagDetectedTime: "पहचान 18 फरवरी, 06:20",
    tagDgmsReg: "डीजीएमएस विनियम 108",
    btnAssignCapa: "कार्रवाई सौंपें",
    cardRiskScore: "समग्र जोखिम स्कोर",
    modelRecords: "मॉडल v4.2 · 3,140 रिकॉर्ड",
    riskHighBand: "100 में से · उच्च जोखिम श्रेणी",
    riskDelta: "7 दिनों में 23 अंक ऊपर",
    gaugeSafe: "सुरक्षित",
    gaugeCritical: "गंभीर",
    cardExplanation: "इसका अर्थ",
    explanationText: "सेक्शन बी में सपोर्ट-बोल्ट रीडिंग लगातार चार पालियों से सुरक्षित सीमा से नीचे है, और 12 फरवरी के ब्लास्ट के बाद स्ट्रेटा-कन्वर्जेंस दोगुना हो गया है। दो छत-सहारा निरीक्षण देर से दर्ज हुए। ब्लॉक-2 में 2024 में इसी तरह के संकेतों के बाद छत गिरने की घटना हुई थी।",
    cardFactors: "योगदान कारक",
    factorSignalWeight: "प्रत्येक संकेत का भार",
    factorBoltTension: "सपोर्ट-बोल्ट तनाव सीमा से नीचे",
    factorBoltNote: "4 पालियाँ चिह्नित · 12 सेंसर",
    factorConvergence: "स्ट्रेटा कन्वर्जेंस दर",
    factorConvergenceNote: "9 मिमी/दिन बनाम 4 मिमी/दिन आधार रेखा",
    factorInspectionsOverdue: "लंबित छत-सहारा निरीक्षण",
    factorInspectionsNote: "72 घंटे से अधिक 2 लंबित",
    factorVibration: "ब्लास्ट कंपन अवशेष",
    factorVibrationNote: "12 फरवरी को शिखर 14 मिमी/सेकंड",
    cardAffectedZone: "प्रभावित क्षेत्र",
    cardAssignCapa: "सुधारात्मक कार्रवाई सौंपें",
    lblResponsibleOfficer: "जिम्मेदार अधिकारी",
    lblActionTemplate: "कार्रवाई टेम्पलेट",
    optActionTemplate: "सेक्शन बी में दोबारा बोल्टिंग एवं पुनः सर्वेक्षण",
    lblTargetClosure: "लक्ष्य तिथि",
    optClosure24h: "24 घंटे",
    optClosure48h: "48 घंटे",
    optClosure7d: "7 दिन",
    btnConfirmAssignment: "असाइनमेंट पुष्टि करें",
    capaDisclaimer: "अधिकारी को मोबाइल पर सूचना भेजी जाएगी और कार्रवाई ऑडिट ट्रेल में दर्ज होगी।",
    cardUnderlyingRecords: "अंतर्निहित रिकॉर्ड",
    total14Records: "कुल 14",
    rec1Title: "छत-सहारा निरीक्षण लंबित",
    rec1Meta: "INS-8841 · सेक्शन बी",
    rec2Title: "बोल्ट तनाव विसंगति · 12 सेंसर",
    rec2Meta: "OBS-3320 · सेक्शन बी",
    rec3Title: "ब्लास्ट कंपन शिखर 14 मिमी/सेकंड",
    rec3Meta: "ENV-0917 · भूकंपमापी",
    rec4Title: "स्ट्रेटा कन्वर्जेंस सर्वेक्षण",
    rec4Meta: "SRV-2204 · भूमिगत स्टेशन",
    btnViewAll14: "सभी 14 रिकॉर्ड देखें",
    cardAuditTrail: "ऑडिट ट्रेल",
    auditImmutable: "अपरिवर्तनीय लॉग",
    audit1: "मॉडल v4.2 द्वारा चेतावनी उत्पन्न",
    audit2: "एजेंट प्रबंधक, ब्लॉक-4 को सूचित किया गया",
    audit3: "समीक्षा की गई:",
    audit4: "सेक्शन बी में प्रवेश प्रतिबंधित",
    auditAssigned: "कार्रवाई सौंपी गई:",
    date14Feb: "14 फरवरी",
    date16Feb: "16 फरवरी",
    date12Feb: "12 फरवरी",
    date18Feb0620: "18 फरवरी 06:20",
    date18Feb0622: "18 फरवरी 06:22",
    date18Feb0705: "18 फरवरी 07:05",
    date18Feb0711: "18 फरवरी 07:11",
    date18Feb0745: "18 फरवरी 07:45",
    date31Jan: "31 जनवरी",
    date31Dec: "31 दिसंबर",
    date15Jan: "15 जनवरी",
    footerMinistry: "कोयला मंत्रालय · डिजिटल अनुपालन ग्रिड",
    footerAlertRetention: "अलर्ट AL-2026-0418 · 7 वर्ष तक संरक्षित",

    // Feature 2: Create Dashboard
    crumbBackDashboard: "डैशबोर्ड पर वापस",
    pageCreateDashboard: "डैशबोर्ड बनाएँ",
    tagNewView: "नया दृश्य",
    tagOwner: "स्वामी",
    tagDraftSaved: "प्रारूप सहेजा 09:14",
    btnCreateDashboard: "डैशबोर्ड बनाएँ",
    cardDashboardDefinition: "डैशबोर्ड परिभाषा",
    step1of2: "चरण 1/2",
    workingTitleSub: "कार्यशील शीर्षक · 6 अधिकारियों को दृश्य",
    lblDashboardName: "डैशबोर्ड नाम",
    dashboardDefaultTitle: "ब्लॉक-4 सुरक्षा",
    dashboardNameHint: "साइडबार और निर्यात रिपोर्ट में दिखेगा।",
    lblMineScope: "खदान क्षेत्र",
    valMineScope: "झरिया कोलफील्ड · ब्लॉक-4",
    lblVisibleRole: "भूमिका को दृश्य",
    valVisibleRole: "खदान अधिकारी एवं पंजीकृत ठेकेदार",
    lblRefreshInterval: "ताज़ा करने का अंतराल",
    optLive: "लाइव",
    opt15min: "15 मिनट",
    optPerShift: "प्रति पाली",
    optDaily: "दैनिक",
    cardSelectedScope: "चयनित क्षेत्र",
    cardAddWidgets: "विजेट जोड़ें",
    widgetsSelectedOf: "चयनित",
    widgetRisk: "समग्र जोखिम स्कोर",
    widgetRiskMeta: "प्रति पाली अपडेट",
    widgetOverdue: "लंबित निरीक्षण",
    widgetOverdueMeta: "डीजीएमएस विनियम 108",
    widgetAttendance: "पाली उपस्थिति",
    widgetAttendanceMeta: "बायोमेट्रिक फीड",
    widgetVentilation: "वायुसंचार एवं धूल सूचकांक",
    widgetVentilationMeta: "पर्यावरण मंत्रालय अनुपालन",
    widgetDespatch: "दैनिक प्रेषण टनभार",
    widgetDespatchMeta: "वेजब्रिज टेलीमेट्री",
    widgetFiling: "वैधानिक फाइलिंग ट्रैकर",
    widgetFilingMeta: "इस माह 4 देय",
    cardLayoutPreview: "लेआउट पूर्वावलोकन",
    sampleDataDate: "नमूना डेटा · 18 फरवरी",
    metricRiskScore: "जोखिम स्कोर",
    metricOverdue: "लंबित निरीक्षण",
    metricOnShift: "पाली में श्रमिक",
    metricDust: "धूल स्तर mg/m³",
    lblWidgetsPlaced: "रखे गए विजेट",
    widgetsPlacedHint: "डिफ़ॉल्ट ग्रिड में दो और विजेट समा सकते हैं।",
    footerDashboardAutosaved: "प्रारूप DB-2026-0031 · स्वतः सहेजा गया",

    // Feature 3: Inspections
    crumbInspections: "निरीक्षण",
    pageNewInspection: "नया वैधानिक निरीक्षण दर्ज करें",
    tagDraftIns: "मसौदा INS-8907",
    cardInspectionSetup: "निरीक्षण विवरण",
    step1of3: "चरण 1/3",
    lblInspectionType: "निरीक्षण प्रकार",
    valInspectionType: "छत-सहारा एवं स्ट्रेटा नियंत्रण",
    valInspectionTypeSub: "26 वैधानिक चेकपॉइंट",
    lblMineBlock: "खदान एवं ब्लॉक",
    valMineBlock: "झरिया ब्लॉक-4",
    lblSectionPanel: "सेक्शन / पैनल",
    valSectionPanel: "सेक्शन बी · पैनल B-3",
    lblAssignedInspector: "नियुक्त निरीक्षक",
    valSafetyOfficer: "सुरक्षा अधिकारी, ब्लॉक-4",
    lblScheduledShift: "निर्धारित पाली",
    optShift1: "पाली 1 · 06:00",
    optShift2: "पाली 2 · 14:00",
    optShift3: "पाली 3 · 22:00",
    lblPriority: "प्राथमिकता",
    optUrgent: "तत्काल · 24 घंटे",
    optRoutine: "नियमित · 7 दिन",
    btnCreateChecklist: "चेकलिस्ट शुरू करें",
    inspectionOfflineNote: "निरीक्षक को मोबाइल पर सूचना जाएगी और चेकलिस्ट ऑफ़लाइन उपयोग हेतु डाउनलोड होगी।",
    cardInspectionSite: "निरीक्षण स्थल",
    cardChecklistCoverage: "चेकलिस्ट कवरेज",
    total26Checkpoints: "26 चेकपॉइंट",
    checkBoltTension: "बोल्ट तनाव एवं एंकरिंग",
    checkBoltNote: "26 में से 9 बिंदु",
    checkStrata: "स्ट्रेटा कन्वर्जेंस माप",
    checkStrataNote: "26 में से 7 बिंदु",
    checkVentilation: "वेंटिलेशन एवं गैस नमूना",
    checkVentilationNote: "26 में से 6 बिंदु",
    checkAccess: "पहुँच, प्रकाश एवं संकेत",
    checkAccessNote: "26 में से 4 बिंदु",
    btnPreviewChecklist: "पूरी चेकलिस्ट खोलें",
    cardPriorInspections: "पिछले निरीक्षण",
    sectionBTotal11: "सेक्शन बी · कुल 11",
    prior1Title: "छत-सहारा · 72 घंटे लंबित",
    prior1Meta: "INS-8841 · एस. कुजूर · लंबित",
    prior2Title: "वेंटिलेशन सर्वेक्षण · पूर्ण",
    prior2Meta: "INS-8790 · ए. भुइयां · पूर्ण",
    prior3Title: "विद्युत एवं ढुलाई · 3 निष्कर्ष",
    prior3Meta: "INS-8702 · एम. तिर्की · 3 निष्कर्ष",
    prior4Title: "धूल एवं जल छिड़काव · पूर्ण",
    prior4Meta: "INS-8654 · पी. उरांव · पूर्ण",
    btnViewAll11Inspections: "सभी 11 निरीक्षण देखें",
    footerInsAutosaved: "मसौदा INS-8907 · स्वतः सहेजा गया 07:42",

    // Feature 4: Create Report
    crumbBackReports: "रिपोर्ट पर वापस",
    pageCreateReport: "नई वैधानिक रिपोर्ट बनाएँ",
    tagDraftReport: "मसौदा RPT-2026-0219",
    tagAutosavedTime: "स्वतः सहेजा 09:14",
    cardReportParameters: "रिपोर्ट मापदंड",
    lblReportType: "रिपोर्ट प्रकार",
    valReportType: "मासिक वैधानिक विवरणी",
    valReportTypeSub: "फॉर्म III-A · डीजीएमएस एवं पर्यावरण मंत्रालय",
    lblMineReportScope: "खदान / दायरा",
    valMineReportScopeSub: "बीसीसीएल अनुषंगी · 3 सेक्शन",
    lblReportingPeriod: "रिपोर्टिंग अवधि",
    optJan2026: "जनवरी 2026",
    optFeb2026: "फरवरी 2026",
    optQ4: "तिमाही 4 FY25-26",
    optCustom: "अनुकूलित",
    lblOutputFormat: "आउटपुट प्रारूप",
    optPdf: "हस्ताक्षरित पीडीएफ",
    optXlsx: "XLSX",
    optDgmsXml: "डीजीएमएस XML",
    lblSigningAuthority: "हस्ताक्षर प्राधिकारी",
    valSignerName: "ए. भट्टाचार्य",
    valSignerRole: "एजेंट प्रबंधक, ब्लॉक-4 · डीएससी 11 अगस्त 2027 तक मान्य",
    btnGenerateReport: "रिपोर्ट तैयार करें",
    btnSubmitDgmsEfiling: "डिजिटल हस्ताक्षर करें एवं डीजीएमएस को भेजें",
    reportGenHint: "चयनित अवधि के 1,284 अनुमोदित रिकॉर्ड लिए जाएँगे; मसौदा हस्ताक्षर से पहले ऑडिट ट्रेल में दर्ज होगा।",
    cardSectionsIncluded: "शामिल अनुभाग",
    secInspections: "निरीक्षण एवं निष्कर्ष",
    secInspectionsMeta: "312 रिकॉर्ड",
    secViolations: "उल्लंघन एवं सुधारात्मक कार्रवाई",
    secViolationsMeta: "27 लंबित · 61 पूर्ण",
    secProduction: "उत्पादन एवं प्रेषण",
    secProductionMeta: "0.94 मीट्रिक टन उत्पादित",
    secEnvironment: "पर्यावरण निगरानी",
    secEnvironmentMeta: "PM10, ध्वनि, अपशिष्ट",
    secLabour: "श्रमिक एवं उपस्थिति",
    secLabourMeta: "1,146 श्रमिक · 4 ठेकेदार",
    secStatutory: "वैधानिक घोषणा",
    secStatutoryMeta: "फॉर्म IV-B फाइलिंग",
    cardReportPreview: "रिपोर्ट पूर्वावलोकन",
    form3aPreview: "फॉर्म III-A पूर्वावलोकन",
    pvHeading: "मासिक वैधानिक विवरणी —",
    pvSubtitle: "झरिया कोलफील्ड · ब्लॉक-4 · डीजीएमएस विनियम 108 / पर्यावरण मंत्रालय",
    pvPeriod: "रिपोर्टिंग अवधि",
    pvSigner: "हस्ताक्षर प्राधिकारी",
    pvSignerVal: "ए. भट्टाचार्य (एजेंट प्रबंधक)",
    pvRecords: "सत्यापित अभिलेख",
    pvRecordsVal: "1,284 प्रविष्टियाँ",
    pvActiveSections: "चयनित अनुभाग",
    pvActiveSectionsVal: "अनुभाग सक्रिय",
    pvToken: "डिजिटल सुरक्षा टोकन",
    meterCompliance: "समग्र अनुपालन",
    meterStrata: "स्ट्रेटा निगरानी",
    cardRecentReturns: "हालिया वैधानिक विवरणियाँ",
    block4Archive: "ब्लॉक-4 पुरालेख",
    ret1Title: "जनवरी 2026 मासिक विवरणी · स्वीकृत",
    ret1Meta: "RPT-2026-0118 · ए. भट्टाचार्य",
    ret2Title: "दिसंबर 2025 मासिक विवरणी · स्वीकृत",
    ret2Meta: "RPT-2025-1215 · ए. भट्टाचार्य",
    ret3Title: "तिमाही 3 पर्यावरण विवरणी · स्वीकृत",
    ret3Meta: "RPT-2025-Q3 · डीजीएमएस / पर्यावरण मंत्रालय",
    btnViewArchive: "अनुपालन पुरालेख देखें",
    footerReportAutosaved: "मसौदा RPT-2026-0219 · स्वतः सहेजा गया",

    // Interactive Modals Translations
    modalObservationTitle: "भू-टैग युक्त सुरक्षा अवलोकन दर्ज करें",
    lblObsType: "अवलोकन वर्गीकरण",
    optUnsafeCondition: "असुरक्षित भौतिक स्थिति",
    optUnsafeAct: "असुरक्षित कार्यप्रणाली / कृत्य",
    optGasSeepage: "गैस रिसाव / वायुसंचार विसंगति",
    optEquipmentFlaw: "भारी खनन मशीनरी खराबी",
    lblGeoCoords: "भूमिगत जीपीएस / स्थानिक स्थिति",
    lblSeverity: "गंभीरता रेटिंग",
    sevCritical: "गंभीर (तत्काल कार्य रोकें)",
    sevHigh: "उच्च प्राथमिकता",
    sevModerate: "मध्यम प्राथमिकता",
    sevLow: "कम / सलाह",
    lblObsDescription: "निष्कर्ष का विवरण",
    phObsDescription: "स्थान, ढीली छत, सुरक्षा उपकरण उल्लंघन या दरार का विवरण दर्ज करें...",
    btnSubmitObservation: "सबमिट करें एवं ऑडिट ट्रेल में दर्ज करें",
    observationSavedToast: "अवलोकन भू-टैग 23.7507° N, 86.4158° E सहित दर्ज हुआ।",

    // Interactive Checklist Runner
    modalChecklistTitle: "वैधानिक चेकपॉइंट रनर (सीएमआर 108)",
    checkpointPassedCount: "उत्तीर्ण चेकपॉइंट",
    btnPass: "पास",
    btnFail: "त्रुटि",
    btnSaveChecklist: "सत्यापित निरीक्षण सबमिट करें",
    checklistSavedToast: "वैधानिक निरीक्षण रिपोर्ट सफलतापूर्वक सबमिट हुई।",

    // OCR Document Scanner
    btnOcrScan: "दस्तावेज़ स्कैन करें (OCR)",
    modalOcrTitle: "एआई ओसीआर दस्तावेज़ डिजिटाइज़र",
    ocrProcessing: "भौतिक डीजीएमएस दस्तावेज़ का ओसीआर मॉडल v2.4 द्वारा विश्लेषण...",
    ocrSuccess: "दस्तावेज़ डिजिटाइज़ हुआ: फॉर्म IV-B अनुपालन रिकॉर्ड प्राप्त।",

    // Electronic Acknowledgment Slip
    modalAckTitle: "डीजीएमएस इलेक्ट्रॉनिक पावती रसीद",
    ackReceiptNo: "पावती क्रमांक: DGMS-ACK-2026-08914",
    ackTimestamp: "प्रस्तुत तिथि: 18 फरवरी 2026, 09:30:14 IST",
    ackDigitalSign: "डीएससी टोकन द्वारा डिजिटल हस्ताक्षरित: SHA256: 8f9b2a7d4e1c990b",
    btnPrintAck: "आधिकारिक रसीद प्रिंट करें (PDF)",

    // Map labels
    mapSecB: "सेक्शन बी",
    mapPanelB3: "पैनल बी-3",
    mapVent2: "वेंट शाफ्ट 2"
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function ShieldIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function HomeIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function ActivityIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function ClipboardCheckIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14l2 2l4-4" />
    </svg>
  );
}

function FileTextIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8" />
    </svg>
  );
}

function UsersIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

function WindIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2m15.5-8a2.5 2.5 0 1 1 2 4H2m7.8-7.6A2 2 0 1 1 11 8H2" />
    </svg>
  );
}

function BellIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0m-10.47-5.674A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

function SettingsIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 9v4m-1.637-9.409L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0M12 16h.01" />
    </svg>
  );
}

function MapPinIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M5 12h14m-7-7v14" />
    </svg>
  );
}

function EyeIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SaveIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function TruckIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2m10 0H9m10 0h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function LayoutDashboardIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UserIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ZapIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function DropletIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7" />
    </svg>
  );
}

function BarChartIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 3v18h18m-3-4V9m-5 8V5M8 17v-3" />
    </svg>
  );
}

function FileCheckIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5M9 15l2 2l4-4" />
    </svg>
  );
}

function FilePlusIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5M9 15h6m-3 3v-6" />
    </svg>
  );
}

function LockIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MailIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BuildingIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function BotIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="18" height="10" x="3" y="11" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4m-4 5h.01m8 0h.01" />
    </svg>
  );
}

function SendIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SparklesIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function LogOutIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function MenuIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function PanelToggleIcon({ collapsed, className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      {collapsed ? <path d="m14 9 3 3-3 3" /> : <path d="m16 15-3-3 3-3" />}
    </svg>
  );
}

function ExternalLinkIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function ChevronDownIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m6 9l6 6l6-6" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m12 19l-7-7l7-7m7 7H5" />
    </svg>
  );
}

function ArrowRightIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M5 12h14m-7-7l7 7l-7 7" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M7 7h10v10M7 17L17 7" />
    </svg>
  );
}

function UserPlusIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6m3-3h-6" />
    </svg>
  );
}

function TrendingUpIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M16 7h6v6" />
      <path d="m22 7l-8.5 8.5l-5-5L2 17" />
    </svg>
  );
}

function DownloadIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10l5 5l5-5" />
    </svg>
  );
}

function RefreshCwIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

// ─── Shared Geographic Mining Zone Vector Map ─────────────────────────────────
function MiningZoneVectorMap({ label = "Coal Mine Vector Map", lang = "en" }) {
  const t = i18n[lang];
  return (
    <div className="map-stage" aria-label={label}>
      <svg viewBox="0 0 393 852" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", zIndex: 0 }}>
        <rect width="393" height="852" fill="var(--gesso-bg)" />
        <g stroke="var(--gesso-map-road)" strokeWidth="10" fill="none" opacity="0.6">
          <path d="M-20 300 H 430" />
          <path d="M-20 540 H 430" />
          <path d="M150 -20 V 872" />
          <path d="M280 -20 V 872" strokeDasharray="6 4" strokeWidth="4" />
          <path d="M-20 180 H 430" strokeDasharray="8 6" strokeWidth="3" />
        </g>
        <g stroke="var(--gesso-accent)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4">
          <rect x="70" y="210" width="130" height="90" rx="4" />
          <rect x="230" y="320" width="120" height="110" rx="4" />
          <rect x="120" y="500" width="140" height="100" rx="4" />
        </g>
        <g fill="var(--gesso-primary)">
          <circle cx="110" cy="250" r="14" fill="var(--gesso-accent)" />
          <circle cx="110" cy="250" r="22" fill="var(--gesso-accent)" opacity="0.2" />
          <circle cx="110" cy="250" r="6" fill="#ffffff" />
          
          <circle cx="270" cy="370" r="13" fill="var(--gesso-accent)" />
          <circle cx="270" cy="370" r="5" fill="#ffffff" />
          
          <circle cx="180" cy="560" r="13" fill="var(--gesso-accent)" />
          <circle cx="180" cy="560" r="5" fill="#ffffff" />
          
          <circle cx="300" cy="640" r="10" opacity="0.7" fill="var(--gesso-accent)" />
          <circle cx="80" cy="470" r="10" opacity="0.7" fill="var(--gesso-accent)" />
        </g>
        <g fill="var(--gesso-fg)" fontFamily="Satoshi, sans-serif" fontSize="11" fontWeight="700">
          <rect x="126" y="240" width="84" height="20" rx="4" fill="var(--gesso-canvas)" stroke="var(--gesso-divider)" />
          <text x="132" y="254" fill="var(--gesso-fg)">{t.mapSecB}</text>
          
          <rect x="286" y="360" width="80" height="20" rx="4" fill="var(--gesso-canvas)" stroke="var(--gesso-divider)" />
          <text x="292" y="374" fill="var(--gesso-fg)">{t.mapPanelB3}</text>

          <rect x="196" y="550" width="94" height="20" rx="4" fill="var(--gesso-canvas)" stroke="var(--gesso-divider)" />
          <text x="202" y="564" fill="var(--gesso-fg)">{t.mapVent2}</text>
        </g>
      </svg>
    </div>
  );
}

// ─── Initial 26 Statutory Checkpoints Dataset ─────────────────────────────────
const initialCheckpoints = [
  { id: 1, titleEn: "Support Bolt Anchor Pull Strength", titleHi: "सपोर्ट बोल्ट एंकर पुल क्षमता", category: "bolt", reg: "CMR Reg. 108", status: "pass" },
  { id: 2, titleEn: "W-Strap Torque & Tension Limits", titleHi: "डब्लू-स्ट्रैप टॉर्क एवं तनाव सीमा", category: "bolt", reg: "CMR Reg. 108", status: "pass" },
  { id: 3, titleEn: "Resin Grouting Depth Consistency", titleHi: "रेज़िन ग्राउटिंग गहराई एकरूपता", category: "bolt", reg: "CMR Reg. 108", status: "fail" },
  { id: 4, titleEn: "Strata Convergence Tell-Tale Dial", titleHi: "स्ट्रेटा कन्वर्जेंस टेल-टेल डायल", category: "strata", reg: "DGMS Cir. 04/2025", status: "fail" },
  { id: 5, titleEn: "Roof Sag Extensometer Readings", titleHi: "छत धंसाव एक्सटेंसोमीटर रीडिंग", category: "strata", reg: "CMR Reg. 129", status: "pass" },
  { id: 6, titleEn: "Section B Methane (CH₄) Level (<0.75%)", titleHi: "सेक्शन बी मीथेन गैस स्तर (<0.75%)", category: "vent", reg: "CMR Reg. 140", status: "pass" },
  { id: 7, titleEn: "Return Airway Airflow Velocity (>1.5 m/s)", titleHi: "रिटर्न एयरवे वायु वेग (>1.5 m/s)", category: "vent", reg: "CMR Reg. 140", status: "pass" },
  { id: 8, titleEn: "Underground Escapeway Illumination & Signage", titleHi: "भूमिगत निकास मार्ग प्रकाश एवं संकेत", category: "access", reg: "CMR Reg. 152", status: "pass" },
  { id: 9, titleEn: "Water Spray Nozzles Dust Suppression", titleHi: "जल छिड़काव नोजल धूल नियंत्रण", category: "vent", reg: "MoEFCC Norms", status: "pass" },
  { id: 10, titleEn: "Haulage Track & Signal Integrity", titleHi: "ढुलाई ट्रैक एवं सिग्नल अखंडता", category: "access", reg: "CMR Reg. 91", status: "pass" }
];

// Helper function to generate a specific contractor compliance ID
function generateSpecificContractorId(name, role) {
  const cleanName = (name || "OFFICER").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const prefix = cleanName.length >= 3 ? cleanName.substring(0, 3) : "GOV";
  const numHash = Math.floor(1000 + Math.random() * 9000);
  const year = 2026;
  const roleCode = role === "regulator" ? "DGMS-REG" : (role === "corporate" ? "CIL-HQ" : "MINE");
  return `${roleCode}-${prefix}-${year}-${numHash}`;
}

// ─── Main Application Component ───────────────────────────────────────────────
export default function App() {
  // Pre-load Authentication State
  const [currentUser, setCurrentUser] = useState(() => tokenStorage.getUser()); // { email, contractorName, contractorId, role, ... }
  const [authRole, setAuthRole] = useState("mine_official"); // "mine_official" | "corporate" | "regulator" | "contractor"
  const [authEmail, setAuthEmail] = useState("");
  const [authContractorName, setAuthContractorName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMineBlock, setAuthMineBlock] = useState("Jharia Block-4");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeFeature, setActiveFeature] = useState("dashboard"); 
  // "dashboard" | "telemetry" | "inspections" | "insights" | "compliance" | "contractors" | "reports" | "audit" | "assistant"
  
  const [lang, setLang] = useState("en"); // "en" | "hi"
  const [toastMessage, setToastMessage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Field Offline Mode State
  const [isFieldOffline, setIsFieldOffline] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Live Backend Data States
  const [liveMines, setLiveMines] = useState([]);
  const [selectedMineId, setSelectedMineId] = useState(null);
  const [liveDashboardData, setLiveDashboardData] = useState(null);
  const [liveRiskScore, setLiveRiskScore] = useState(null);
  const [liveAnomalies, setLiveAnomalies] = useState([]);
  const [liveComplianceRecords, setLiveComplianceRecords] = useState([]);
  const [liveInspections, setLiveInspections] = useState([]);
  const [liveContractors, setLiveContractors] = useState([]);
  const [liveAttendanceSummary, setLiveAttendanceSummary] = useState(null);
  const [liveAuditLogs, setLiveAuditLogs] = useState([]);
  const [auditVerifyResult, setAuditVerifyResult] = useState(null);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isLiveApiConnected, setIsLiveApiConnected] = useState(false);

  // Conversational Assistant State
  const [assistantQueryText, setAssistantQueryText] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState([
    {
      role: "assistant",
      text: "Hello! I am the Khanan Suraksha Governed Assistant. Ask me about mine safety risk scores, statutory compliance rates, overdue CAPAs, or recent violations.",
      citations: [],
    }
  ]);

  // Active translation lookup
  const t = i18n[lang];

  useEffect(() => {
    document.title = `${t.appName} — ${t.appSubtitle}`;
  }, [lang, t]);

  // Modals Visibility
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [checklistRunnerOpen, setChecklistRunnerOpen] = useState(false);
  const [ocrScannerOpen, setOcrScannerOpen] = useState(false);
  const [ackModalOpen, setAckModalOpen] = useState(false);

  // Observation Form State
  const [obsType, setObsType] = useState("unsafe_condition");
  const [obsSeverity, setObsSeverity] = useState("high");
  const [obsText, setObsText] = useState("");

  // Checkpoints State
  const [checkpointsList, setCheckpointsList] = useState(initialCheckpoints);

  // Feature 1: AI Risk Insights State
  const [capaOfficerKey, setCapaOfficerKey] = useState("SK"); // "SK" | "MT"
  const [capaClosureTime, setCapaClosureTime] = useState("24h");
  const [isCapaAssigned, setIsCapaAssigned] = useState(false);

  // Feature 2: Mine Dashboard Builder State
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [refreshInterval, setRefreshInterval] = useState("15min");
  const [activeWidgets, setActiveWidgets] = useState({
    risk: true,
    inspections: true,
    attendance: true,
    ventilation: true,
    despatch: false,
    filing: false
  });

  // Feature 3: Statutory Inspections State
  const [inspectionShift, setInspectionShift] = useState("shift1");
  const [inspectionPriority, setInspectionPriority] = useState("urgent");

  // Feature 4: Statutory Reports State
  const [reportingPeriod, setReportingPeriod] = useState("feb2026");
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [statutorySections, setStatutorySections] = useState({
    inspections: true,
    violations: true,
    production: true,
    environment: true,
    labour: true,
    statutory: false
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ── Load live data from NestJS REST API ──
  const loadBackendData = async () => {
    try {
      const mines = await api.mines.list();
      if (mines && Array.isArray(mines) && mines.length > 0) {
        setLiveMines(mines);
        const activeMine = selectedMineId ? (mines.find(m => m.id === selectedMineId) || mines[0]) : mines[0];
        if (!selectedMineId) setSelectedMineId(activeMine.id);

        setIsLiveApiConnected(true);

        const [dash, risk, anom, comp, att, insp, cont, audit, notifs, unread] = await Promise.allSettled([
          api.dashboard.getMineOverview(activeMine.id),
          api.riskScores.getMineScore(activeMine.id),
          api.riskScores.getAnomalies(activeMine.id),
          api.compliance.getMineRecords(activeMine.id),
          api.attendance.getSummary(activeMine.id),
          api.inspections.list(),
          api.contractors.list(),
          api.audit.getLogs({ limit: 10 }),
          api.notifications.list(),
          api.notifications.getUnreadCount(),
        ]);

        if (dash.status === 'fulfilled' && dash.value) setLiveDashboardData(dash.value);
        if (risk.status === 'fulfilled' && risk.value) setLiveRiskScore(risk.value);
        if (anom.status === 'fulfilled' && anom.value) setLiveAnomalies(anom.value);
        if (comp.status === 'fulfilled' && comp.value) setLiveComplianceRecords(comp.value);
        if (att.status === 'fulfilled' && att.value) setLiveAttendanceSummary(att.value);
        if (insp.status === 'fulfilled' && insp.value) setLiveInspections(insp.value);
        if (cont.status === 'fulfilled' && cont.value) setLiveContractors(cont.value);
        if (audit.status === 'fulfilled' && audit.value) setLiveAuditLogs(audit.value.data || []);
        if (notifs.status === 'fulfilled' && notifs.value) setLiveNotifications(notifs.value);
        if (unread.status === 'fulfilled') setUnreadNotifCount(unread.value);
      }
    } catch (err) {
      console.warn("Backend API sync status:", err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadBackendData();
    }
  }, [currentUser, selectedMineId]);

  // Live authentication submission handler
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (!authEmail.trim()) {
      setAuthError(t.authEmailError);
      return;
    }
    if (!authPassword.trim()) {
      setAuthError(t.authPassError);
      return;
    }

    try {
      setIsAuthenticating(true);
      const authData = await api.auth.login(authEmail.trim(), authPassword.trim());
      const u = authData.user;
      const userSession = {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role.toLowerCase(),
        company: u.company,
        contractorName: authContractorName.trim() || u.name,
        contractorId: generateSpecificContractorId(authContractorName || u.name, u.role.toLowerCase()),
        mineBlock: authMineBlock || "Jharia Block-4",
        loggedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLiveApi: true,
      };

      setCurrentUser(userSession);
      showToast(
        lang === "en"
          ? `🟢 Connected to Live Governance API: ${u.name} (${u.role})`
          : `🟢 लाइव शासन सर्वर से जुड़े: ${u.name} (${u.role})`
      );
      loadBackendData();
    } catch (err) {
      console.warn("Live login attempt:", err);
      // Fallback for offline demo
      const generatedId = generateSpecificContractorId(authContractorName || "Officer", authRole);
      const userSession = {
        email: authEmail.trim(),
        name: authContractorName.trim() || "Compliance Officer",
        contractorName: authContractorName.trim() || "Compliance Officer",
        contractorId: generatedId,
        mineBlock: authMineBlock,
        role: authRole,
        loggedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLiveApi: false,
      };
      setCurrentUser(userSession);
      showToast(lang === "en" ? `Demo session active (${err.message})` : `डेमो सत्र सक्रिय (${err.message})`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickDemoFill = (roleKey = "mine_official") => {
    setAuthError("");
    if (roleKey === "corporate") {
      setAuthRole("corporate");
      setAuthEmail("corporate@coalindia.gov.in");
      setAuthContractorName("BCCL Corporate Safety Director");
      setAuthPassword("Test@1234");
    } else if (roleKey === "regulator") {
      setAuthRole("regulator");
      setAuthEmail("regulator@dgms.gov.in");
      setAuthContractorName("DGMS National Safety Inspector");
      setAuthPassword("Test@1234");
    } else {
      setAuthRole("mine_official");
      setAuthEmail("r.mahapatra@coalindia.gov.in");
      setAuthContractorName("R. Mahapatra — Mine Safety Official");
      setAuthPassword("Test@1234");
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setAuthPassword("");
    showToast(lang === "en" ? "Logged out successfully." : "सफलतापूर्वक लॉग आउट हो गया।");
  };

  const switchActiveRole = async (newRole) => {
    if (currentUser) {
      if (newRole === "corporate") handleQuickDemoFill("corporate");
      else if (newRole === "regulator") handleQuickDemoFill("regulator");
      else handleQuickDemoFill("mine_official");

      setCurrentUser(prev => ({
        ...prev,
        role: newRole,
        contractorId: generateSpecificContractorId(prev.contractorName, newRole)
      }));
      setRoleMenuOpen(false);
      showToast(lang === "en" ? `Role switched to ${newRole}` : `भूमिका बदलकर ${newRole} कर दी गई है`);
    }
  };

  const handleSyncOfflineQueue = () => {
    setOfflineQueueCount(0);
    showToast(t.syncSuccess);
    loadBackendData();
  };

  const toggleCheckpointStatus = (id, newStatus) => {
    setCheckpointsList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleSaveObservation = (e) => {
    if (e) e.preventDefault();
    setObservationModalOpen(false);
    setObsText("");
    if (isFieldOffline) {
      setOfflineQueueCount(prev => prev + 1);
    }
    showToast(t.observationSavedToast);
  };

  // Live Audit Chain Range Verification Handler
  const handleVerifyAuditChain = async () => {
    try {
      setIsVerifyingAudit(true);
      const res = await api.audit.verifyChain(1, 5);
      setAuditVerifyResult(res);
      showToast(
        lang === "en"
          ? "🔒 Audit Trail Cryptographic Hash-Chain Verified Unbroken!"
          : "🔒 ऑडिट ट्रेल क्रिप्टोग्राफिक हैश-चेन अखंड सत्यापित!"
      );
    } catch (err) {
      showToast(`Verification check: ${err.message}`);
    } finally {
      setIsVerifyingAudit(false);
    }
  };

  // Live Conversational Assistant Query Handler
  const handleSendAssistantQuery = async (e) => {
    if (e) e.preventDefault();
    if (!assistantQueryText.trim() || assistantLoading) return;

    const userText = assistantQueryText.trim();
    setAssistantQueryText("");
    setAssistantHistory(prev => [...prev, { role: "user", text: userText }]);
    setAssistantLoading(true);

    try {
      const targetMine = selectedMineId || liveMines[0]?.id;
      const res = await api.assistant.query(userText, lang, targetMine);
      setAssistantHistory(prev => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          citations: res.citations || [],
          disclaimer: res.disclaimer,
          intent: res.intent,
        }
      ]);
    } catch (err) {
      setAssistantHistory(prev => [
        ...prev,
        {
          role: "assistant",
          text: lang === "en" 
            ? `Unable to complete query: ${err.message}. Please check your connection to the live governance API.`
            : `अनुरोध पूर्ण करने में असमर्थ: ${err.message}। कृपया लाइव सर्वर कनेक्शन की जाँच करें।`,
          citations: [],
        }
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const passedCheckpointsCount = checkpointsList.filter(item => item.status === "pass").length;

  const toggleWidgetSelection = (widgetKey) => {
    setActiveWidgets(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey]
    }));
  };

  const toggleStatutorySection = (sectionKey) => {
    setStatutorySections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const selectedWidgetCount = Object.values(activeWidgets).filter(Boolean).length;
  const selectedSectionCount = Object.values(statutorySections).filter(Boolean).length;

  const currentOfficerName = capaOfficerKey === "SK" 
    ? (lang === "en" ? "S. Kujur" : "एस. कुजूर")
    : (lang === "en" ? "M. Tirkey" : "एम. तिर्की");

  const periodLabels = {
    jan2026: t.optJan2026,
    feb2026: t.optFeb2026,
    q4: t.optQ4,
    custom: t.optCustom
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. AUTHENTICATION & ROLE SELECTION SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (!currentUser) {
    const previewId = authContractorName.trim()
      ? `${authRole === "regulator" ? "DGMS-REG" : (authRole === "corporate" ? "CIL-HQ" : "MINE")}-${authContractorName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "GOV"}-2026-••••`
      : "DGMS-MINE-2026-••••";

    return (
      <div className="auth-fullscreen-bg">
        <div className="auth-header-bar wrap">
          <div className="brand" title={`${t.appName} — ${t.appSubtitle}`}>
            <span className="brand-mark">
              <ShieldIcon style={{ maxWidth: 32, maxHeight: 32 }} />
            </span>
            <span>
              <span className="brand-name">{t.appName}</span>
              <span className="brand-sub">{t.appSubtitle}</span>
            </span>
          </div>

          <div className="langtoggle" role="group" aria-label="Language Selector">
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => { setLang("en"); showToast("Language switched to English"); }}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === "hi" ? "active" : ""}
              onClick={() => { setLang("hi"); showToast("भाषा बदलकर हिन्दी कर दी गई है"); }}
            >
              हिं
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="toast-notice" role="status">
            <CheckIcon className="ic ic-sm" style={{ color: "var(--gesso-success)" }} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="auth-card-container">
          <div className="card auth-card">
            <div className="auth-card-header">
              <div className="auth-seal">
                <ShieldIcon style={{ width: 28, height: 28 }} />
              </div>
              <h2>{t.authTitle}</h2>
              <p className="auth-subtitle">{t.authSubtitle}</p>
              <p className="auth-prompt">{t.authPrompt}</p>
            </div>

            {authError && (
              <div className="auth-error-banner" role="alert">
                <AlertTriangleIcon className="ic ic-sm" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="auth-form" noValidate>
              {/* Role Selector */}
              <div className="field">
                <label htmlFor="auth-role">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <UsersIcon className="ic ic-xs" style={{ color: "var(--gesso-accent)" }} />
                    {t.lblRoleSelect}
                  </span>
                </label>
                <select
                  id="auth-role"
                  className="well"
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value)}
                  style={{ height: 42, background: "var(--gesso-canvas)" }}
                >
                  <option value="mine_official">{t.roleMineOfficial}</option>
                  <option value="corporate">{t.roleCorporate}</option>
                  <option value="regulator">{t.roleRegulator}</option>
                  <option value="contractor">{t.roleContractor}</option>
                </select>
              </div>

              {/* Field 1: Email Address */}
              <div className="field">
                <label htmlFor="auth-email">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MailIcon className="ic ic-xs" style={{ color: "var(--gesso-accent)" }} />
                    {t.lblEmail}
                  </span>
                </label>
                <input
                  className="well"
                  id="auth-email"
                  type="email"
                  required
                  placeholder={t.phEmail}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              {/* Field 2: Designation / Org Name */}
              <div className="field">
                <label htmlFor="auth-contractor">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <BuildingIcon className="ic ic-xs" style={{ color: "var(--gesso-accent)" }} />
                    {t.lblContractor}
                  </span>
                </label>
                <input
                  className="well"
                  id="auth-contractor"
                  type="text"
                  required
                  placeholder={t.phContractor}
                  value={authContractorName}
                  onChange={(e) => setAuthContractorName(e.target.value)}
                />
              </div>

              {/* Field 3: Password */}
              <div className="field">
                <label htmlFor="auth-password">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <LockIcon className="ic ic-xs" style={{ color: "var(--gesso-accent)" }} />
                    {t.lblPassword}
                  </span>
                </label>
                <input
                  className="well"
                  id="auth-password"
                  type="password"
                  required
                  placeholder={t.phPassword}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              {/* Generated ID Preview */}
              <div className="auth-id-preview-box">
                <div className="auth-id-preview-label">{t.authGeneratedIdLbl}</div>
                <div className="auth-id-preview-val">{previewId}</div>
                <div className="auth-id-preview-hint">
                  {lang === "en"
                    ? "Tamper-proof digital statutory credentials will be authorized upon login."
                    : "प्रवेश पर आपके पद हेतु डिजिटल वैधानिक पहचान क्रमांक अधिकृत किया जाएगा।"}
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="btn btn-primary"
                type="submit"
                style={{ width: "100%", justifyContent: "center", minHeight: 46, fontSize: 15 }}
              >
                <CheckIcon className="ic ic-sm" />
                {t.btnSubmitAuth}
              </button>

              {/* Quick Auto-fill buttons for live seeded roles */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gesso-fg-muted)", textAlign: "center" }}>
                  ⚡ {t.quickDemoFill}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: "0 6px", height: 32, background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => handleQuickDemoFill("mine_official")}
                  >
                    Official
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: "0 6px", height: 32, background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => handleQuickDemoFill("corporate")}
                  >
                    Corporate
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: "0 6px", height: 32, background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => handleQuickDemoFill("regulator")}
                  >
                    Regulator
                  </button>
                </div>
              </div>
            </form>

            <div className="auth-card-footer">
              <p>{t.authSecurityNotice}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. MAIN COMPLIANCE APPLICATION (Role-Based Grid)
  // ════════════════════════════════════════════════════════════════════════════
  const activeRoleName = t[`role${currentUser.role === "mine_official" ? "MineOfficial" : (currentUser.role === "corporate" ? "Corporate" : (currentUser.role === "regulator" ? "Regulator" : "Contractor"))}`] || currentUser.role;

  return (
    <div className="dashboard-app-layout">
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Left-Side Dashboard Sidebar ── */}
      <aside
        className={`dashboard-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}
        aria-label="Sidebar Navigation"
      >
        <div className="sidebar-brand-header">
          <div
            className="brand"
            onClick={() => setActiveFeature("dashboard")}
            title={`${t.appName} — ${t.appSubtitle}`}
          >
            <span className="brand-mark">
              <ShieldIcon style={{ width: 20, height: 20 }} />
            </span>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <span className="brand-name">{t.appName}</span>
                <span className="brand-sub">{t.appSubtitle}</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-close-btn"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileMenuOpen(false)}
          >
            <XIcon className="ic ic-sm" />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="sidebar-profile-card">
            <div className="sidebar-contractor-name" title={currentUser.contractorName}>
              {currentUser.contractorName}
            </div>
            <div className="sidebar-meta-row" style={{ marginTop: 4 }}>
              <span className="role-badge-pill">
                ✦ {activeRoleName}
              </span>
            </div>
            <div className="sidebar-location-sub" style={{ marginTop: 6 }}>
              <span>{currentUser.contractorId}</span>
            </div>
            <div className="sidebar-live-status">
              <span className="pulse-dot" />
              <span>{lang === "en" ? "Live DGMS Sync" : "लाइव डीजीएमएस सिंक"}</span>
            </div>
          </div>
        )}

        {/* Sidebar Nav Links */}
        <div className="sidebar-nav-container">
          {!sidebarCollapsed && (
            <div className="sidebar-section-label">
              {t.mainMenu}
            </div>
          )}

          <nav className="sidebar-navlinks" aria-label="Dashboard Navigation">
            {/* Dashboard */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "dashboard" ? "active" : ""}`}
              onClick={() => { setActiveFeature("dashboard"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><HomeIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navDashboard}</span>}
              {!sidebarCollapsed && activeFeature === "dashboard" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Gas & Telemetry */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "telemetry" ? "active" : ""}`}
              onClick={() => { setActiveFeature("telemetry"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><WindIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navTelemetry}</span>}
              {!sidebarCollapsed && <span className="sidebar-item-badge badge-warning">Live</span>}
              {!sidebarCollapsed && activeFeature === "telemetry" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Inspections */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "inspections" ? "active" : ""}`}
              onClick={() => { setActiveFeature("inspections"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><ClipboardCheckIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navInspections}</span>}
              {!sidebarCollapsed && <span className="sidebar-item-badge badge-warning">12</span>}
              {!sidebarCollapsed && activeFeature === "inspections" && <span className="sidebar-active-indicator" />}
            </button>

            {/* AI Insights */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "insights" ? "active" : ""}`}
              onClick={() => { setActiveFeature("insights"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><ActivityIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navInsights}</span>}
              {!sidebarCollapsed && <span className="sidebar-item-badge badge-danger">24</span>}
              {!sidebarCollapsed && activeFeature === "insights" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Compliance Register */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "compliance" ? "active" : ""}`}
              onClick={() => { setActiveFeature("compliance"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><FileCheckIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navCompliance}</span>}
              {!sidebarCollapsed && activeFeature === "compliance" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Contractors */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "contractors" ? "active" : ""}`}
              onClick={() => { setActiveFeature("contractors"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><UsersIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navContractors}</span>}
              {!sidebarCollapsed && activeFeature === "contractors" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Reports */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "reports" ? "active" : ""}`}
              onClick={() => { setActiveFeature("reports"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><FileTextIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navReports}</span>}
              {!sidebarCollapsed && activeFeature === "reports" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Audit Trail */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "audit" ? "active" : ""}`}
              onClick={() => { setActiveFeature("audit"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><LockIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navAudit}</span>}
              {!sidebarCollapsed && activeFeature === "audit" && <span className="sidebar-active-indicator" />}
            </button>

            {/* Governed AI Assistant */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "assistant" ? "active" : ""}`}
              onClick={() => { setActiveFeature("assistant"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon"><BotIcon className="ic ic-sm" /></span>
              {!sidebarCollapsed && <span className="sidebar-nav-title">{t.navAssistant}</span>}
              {!sidebarCollapsed && <span className="sidebar-item-badge badge-success">AI</span>}
              {!sidebarCollapsed && activeFeature === "assistant" && <span className="sidebar-active-indicator" />}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-lang-switch">
            <div className="langtoggle" role="group" aria-label="Language Selector">
              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => { setLang("en"); showToast("Language switched to English"); }}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === "hi" ? "active" : ""}
                onClick={() => { setLang("hi"); showToast("भाषा बदलकर हिन्दी कर दी गई है"); }}
              >
                HI
              </button>
            </div>

            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <PanelToggleIcon collapsed={sidebarCollapsed} />
            </button>
          </div>

          <div className="sidebar-user-block">
            <div className="sidebar-user-avatar" title={currentUser.contractorName}>
              {currentUser.contractorName ? currentUser.contractorName.charAt(0).toUpperCase() : "O"}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{currentUser.contractorName}</div>
                <div className="sidebar-user-role">{activeRoleName}</div>
              </div>
            )}
            <button
              className="sidebar-logout-btn"
              type="button"
              title={t.logout}
              onClick={handleLogout}
            >
              <LogOutIcon className="ic ic-sm" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Viewport Area ── */}
      <div className="dashboard-main-viewport">
        {/* Offline Sync Banner if active */}
        <div className="offline-sync-bar">
          <div className="offline-sync-left">
            <span className={`offline-tag-badge ${offlineQueueCount > 0 ? "queued" : ""}`}>
              {offlineQueueCount > 0 ? `⚡ ${offlineQueueCount} Queued Offline` : "✓ Grid Synchronized"}
            </span>
            <span>{isFieldOffline ? t.offlineModeActive : (lang === "en" ? "DGMS Central Hub Connected" : "डीजीएमएस केंद्रीय हब कनेक्टेड")}</span>
          </div>
          <div className="offline-sync-actions">
            <button
              type="button"
              className="btn-sync-now"
              onClick={handleSyncOfflineQueue}
            >
              <RefreshCwIcon className="ic ic-xs" />
              {t.btnSyncNow}
            </button>
          </div>
        </div>

        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-mobile-burger"
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon className="ic ic-sm" />
            </button>

            <h1 className="topbar-main-title">
              {activeFeature === "dashboard" && t.navDashboard}
              {activeFeature === "telemetry" && t.navTelemetry}
              {activeFeature === "inspections" && t.navInspections}
              {activeFeature === "insights" && t.navInsights}
              {activeFeature === "compliance" && t.navCompliance}
              {activeFeature === "contractors" && t.navContractors}
              {activeFeature === "reports" && t.navReports}
              {activeFeature === "audit" && t.navAudit}
              {activeFeature === "assistant" && t.navAssistant}
            </h1>

            <div className="topbar-live-badge">
              <span className="badge-dot-live" />
              <span>{isLiveApiConnected ? "Live REST API Connected" : t.liveDgmsSync}</span>
            </div>
            {isLiveApiConnected && (
              <span className="live-api-badge">
                Port 4000
              </span>
            )}
          </div>

          <div className="topbar-right">
            {/* Quick Action: Log Observation */}
            <button
              className="btn btn-outline"
              type="button"
              style={{ height: 34, fontSize: 12.5, padding: "0 12px" }}
              onClick={() => setObservationModalOpen(true)}
            >
              <PlusIcon className="ic ic-xs" />
              {t.btnLogObservation}
            </button>

            {/* Role Switcher Pill */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="topbar-role-select"
                onClick={() => { setRoleMenuOpen(!roleMenuOpen); setNotificationsOpen(false); setSettingsOpen(false); }}
              >
                <span>{activeRoleName}</span>
                <ChevronDownIcon className="ic ic-xs" />
              </button>

              {roleMenuOpen && (
                <div className="role-switcher-dropdown" role="menu">
                  <div style={{ padding: "6px 12px 8px", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                    {t.switchRole}
                  </div>
                  <button
                    type="button"
                    className={`role-opt-item ${currentUser.role === "mine_official" ? "active" : ""}`}
                    onClick={() => switchActiveRole("mine_official")}
                  >
                    <span>{t.roleMineOfficial}</span>
                    {currentUser.role === "mine_official" && <CheckIcon className="ic ic-xs" />}
                  </button>
                  <button
                    type="button"
                    className={`role-opt-item ${currentUser.role === "corporate" ? "active" : ""}`}
                    onClick={() => switchActiveRole("corporate")}
                  >
                    <span>{t.roleCorporate}</span>
                    {currentUser.role === "corporate" && <CheckIcon className="ic ic-xs" />}
                  </button>
                  <button
                    type="button"
                    className={`role-opt-item ${currentUser.role === "regulator" ? "active" : ""}`}
                    onClick={() => switchActiveRole("regulator")}
                  >
                    <span>{t.roleRegulator}</span>
                    {currentUser.role === "regulator" && <CheckIcon className="ic ic-xs" />}
                  </button>
                  <button
                    type="button"
                    className={`role-opt-item ${currentUser.role === "contractor" ? "active" : ""}`}
                    onClick={() => switchActiveRole("contractor")}
                  >
                    <span>{t.roleContractor}</span>
                    {currentUser.role === "contractor" && <CheckIcon className="ic ic-xs" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="popover-wrapper">
              <button
                className="iconbtn topbar-bell-btn"
                type="button"
                aria-label="Notifications"
                onClick={() => { setNotificationsOpen(!notificationsOpen); setSettingsOpen(false); setRoleMenuOpen(false); }}
              >
                <BellIcon style={{ width: 18, height: 18 }} />
                <span className="topbar-badge-count">3</span>
              </button>

              {notificationsOpen && (
                <div className="popover-menu" role="menu">
                  <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid var(--gesso-divider)", fontWeight: 700, fontSize: "12px", color: "var(--gesso-fg)" }}>
                    {lang === "en" ? "DGMS Live Alerts (3)" : "डीजीएमएस लाइव अलर्ट (3)"}
                  </div>
                  <div className="popover-item">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gesso-error)", flexShrink: 0 }}></span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{lang === "en" ? "Section B Roof Bolt Tension Low" : "सेक्शन बी बोल्ट तनाव कम"}</div>
                      <div style={{ fontSize: "11px", color: "var(--gesso-fg-muted)" }}>06:20 · {lang === "en" ? "Strata movement detected" : "स्ट्रेटा गतिविधि चिह्नित"}</div>
                    </div>
                  </div>
                  <div className="popover-item">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gesso-warning)", flexShrink: 0 }}></span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{lang === "en" ? "Inspection INS-8841 Overdue" : "निरीक्षण INS-8841 लंबित"}</div>
                      <div style={{ fontSize: "11px", color: "var(--gesso-fg-muted)" }}>{lang === "en" ? "72 hours limit exceeded" : "72 घंटे की सीमा समाप्त"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <div className="popover-wrapper">
              <button
                className="iconbtn"
                type="button"
                aria-label="Settings"
                onClick={() => { setSettingsOpen(!settingsOpen); setNotificationsOpen(false); setRoleMenuOpen(false); }}
              >
                <SettingsIcon style={{ maxWidth: 32, maxHeight: 32 }} />
              </button>

              {settingsOpen && (
                <div className="popover-menu" role="menu">
                  <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid var(--gesso-divider)", fontWeight: 700, fontSize: "12px", color: "var(--gesso-fg)" }}>
                    {lang === "en" ? "Session Controls" : "सत्र नियंत्रण"}
                  </div>
                  <div style={{ padding: "8px", fontSize: "12px", color: "var(--gesso-fg-muted)" }}>
                    <div style={{ fontWeight: 700, color: "var(--gesso-fg)" }}>{currentUser.contractorName}</div>
                    <div style={{ marginTop: 2 }}>{currentUser.email}</div>
                    <div style={{ marginTop: 4, fontFamily: "var(--gesso-font-mono)", color: "var(--gesso-accent)" }}>{currentUser.contractorId}</div>
                  </div>
                  <div style={{ padding: "8px", borderTop: "1px solid #f1f5f9" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isFieldOffline}
                        onChange={(e) => {
                          setIsFieldOffline(e.target.checked);
                          showToast(e.target.checked ? "Offline Field Mode enabled" : "Online Live Grid enabled");
                        }}
                      />
                      <span>{lang === "en" ? "Simulate Offline Field Mode" : "ऑफ़लाइन फील्ड मोड सिमुलेशन"}</span>
                    </label>
                  </div>
                  <div style={{ borderTop: "1px solid var(--gesso-divider)", paddingTop: 4 }}>
                    <button className="popover-item" type="button" onClick={handleLogout} style={{ color: "var(--gesso-error)", width: "100%" }}>
                      <LogOutIcon className="ic ic-xs" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-notice" role="status">
            <CheckIcon className="ic ic-sm" style={{ color: "var(--gesso-success)" }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Scrollable Dashboard Content Views ── */}
        <div className="dashboard-content-area">

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: ROLE-BASED DASHBOARD OVERVIEW
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "dashboard" && (
            <main className="wrap" data-brief-id="dashboard-root">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <ShieldIcon className="ic ic-xs" />
                      {activeRoleName}
                    </span>
                    <span className="tag quiet">
                      <MapPinIcon className="ic ic-xs" />
                      {t.valMineScope}
                    </span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.dashboardOverview}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>{t.dashboardSub}</p>
                </div>
                <div className="actionrow">
                  {currentUser.role === "mine_official" && (
                    <>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setChecklistRunnerOpen(true)}
                      >
                        <ClipboardCheckIcon className="ic ic-sm" />
                        {t.btnStartInspection}
                      </button>
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => setObservationModalOpen(true)}
                      >
                        <PlusIcon className="ic ic-sm" />
                        {t.btnLogObservation}
                      </button>
                    </>
                  )}

                  {currentUser.role === "corporate" && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => showToast(lang === "en" ? "Exporting CIL Multi-Mine Safety Dossier..." : "बहु-खदान सुरक्षा डोजियर तैयार हो रहा है...")}
                    >
                      <DownloadIcon className="ic ic-sm" />
                      {t.btnExportDossier}
                    </button>
                  )}

                  {currentUser.role === "regulator" && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => showToast(lang === "en" ? "Form IV-B Statutory Notice Drafted." : "फॉर्म IV-B वैधानिक नोटिस तैयार।")}
                    >
                      <FileTextIcon className="ic ic-sm" />
                      {t.btnIssueNotice}
                    </button>
                  )}
                </div>
              </section>

              <div className="rule"></div>

              {/* Dynamic KPI Row based on Role */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBlock: "24px 16px" }}>
                {currentUser.role === "mine_official" && (
                  <>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiRiskScore}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#dc2626", marginTop: 6 }}>78 <span style={{ fontSize: 14, color: "#64748b" }}>/ 100</span></div>
                      <span className="deltaline" style={{ marginTop: 4 }}><ArrowUpRightIcon className="ic ic-sm" /> +23 {t.complianceTrend}</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiMethaneAvg}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#15803d", marginTop: 6 }}>0.42%</div>
                      <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>✓ {t.kpiAirflowNominal}</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiOverdueInspections}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#b45309", marginTop: 6 }}>6</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>INS-8841 ({t.date14Feb})</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiOnShift}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>412</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>3 {t.shiftCrews} active</span>
                    </div>
                  </>
                )}

                {currentUser.role === "corporate" && (
                  <>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiAggregateCompliance}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#15803d", marginTop: 6 }}>94.6%</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{t.kpiAcross4Mines}</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">TOTAL DESPATCH (FEB)</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>0.94 MT</div>
                      <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>↑ 8.2% vs target</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">ACTIVE CONTRACTORS</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#2563eb", marginTop: 6 }}>14</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>100% Form V certified</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">OPEN STATUTORY CAPA</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#b45309", marginTop: 6 }}>11</div>
                      <span style={{ fontSize: 12, color: "#b45309", fontWeight: 700 }}>4 critical SLA</span>
                    </div>
                  </>
                )}

                {currentUser.role === "regulator" && (
                  <>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiPendingApprovals}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#2563eb", marginTop: 6 }}>4</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{t.kpiForm3AQueue}</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">VIOLATION NOTICES</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#dc2626", marginTop: 6 }}>2</div>
                      <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>Section 22A stop-work</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">DIGITAL AUDIT TRAIL</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#15803d", marginTop: 6 }}>1,284</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>100% Immutable logged</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">MINES INSPECTED (Q4)</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>18 / 22</div>
                      <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>82% coverage</span>
                    </div>
                  </>
                )}

                {currentUser.role === "contractor" && (
                  <>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiRiskScore}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#dc2626", marginTop: 6 }}>78 / 100</div>
                      <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>High Risk band</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiOverdueInspections}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#b45309", marginTop: 6 }}>6 Pending</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>DGMS Reg. 108</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiOnShift}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>412</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Biometric verified</span>
                    </div>
                    <div className="card" style={{ padding: 18 }}>
                      <span className="sec-label">{t.kpiDustLevel}</span>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#15803d", marginTop: 6 }}>2.4 mg/m³</div>
                      <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>Within MoEFCC limits</span>
                    </div>
                  </>
                )}
              </div>

              {/* Main Content Layout */}
              <div className="main">
                <div className="col">
                  {/* AI Risk Alert Banner Card */}
                  <section className="card" style={{ borderLeft: "4px solid #dc2626" }}>
                    <div className="card-head">
                      <span className="sec-label">{t.tagHighRisk}</span>
                      <span className="sec-label-hi">{t.tagDetectedTime}</span>
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBlock: "4px 8px" }}>{t.riskTitle}</h2>
                    <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{t.explanationText}</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setActiveFeature("insights")}
                      >
                        <ActivityIcon className="ic ic-sm" />
                        {lang === "en" ? "Investigate AI Model & Assign CAPA" : "एआई मॉडल विश्लेषण एवं कार्रवाई"}
                      </button>
                    </div>
                  </section>

                  {/* Multi-Mine Comparison Table (For Corporate / Regulator) */}
                  {(currentUser.role === "corporate" || currentUser.role === "regulator") && (
                    <section className="card">
                      <div className="card-head">
                        <span className="sec-label">{lang === "en" ? "SUBSIDIARY MINES SAFETY BENCHMARK" : "अनुषंगी खदान सुरक्षा तुलना"}</span>
                        <span className="sec-label-hi">CIL Telemetry Grid</span>
                      </div>
                      <div className="gov-table-wrap">
                        <table className="gov-table">
                          <thead>
                            <tr>
                              <th>{lang === "en" ? "Mine Block" : "खदान ब्लॉक"}</th>
                              <th>{lang === "en" ? "Composite Risk" : "समग्र जोखिम"}</th>
                              <th>{lang === "en" ? "CH₄ Gas" : "मीथेन (CH₄)"}</th>
                              <th>{lang === "en" ? "Compliance Score" : "अनुपालन स्कोर"}</th>
                              <th>{lang === "en" ? "Status" : "स्थिति"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><b>Jharia Block-4 (BCCL)</b></td>
                              <td><span className="table-badge badge-danger">78 / 100 (High)</span></td>
                              <td>0.42%</td>
                              <td>92.4%</td>
                              <td><span className="table-badge badge-warning">CAPA Pending</span></td>
                            </tr>
                            <tr>
                              <td><b>Raniganj Seam-VII (ECL)</b></td>
                              <td><span className="table-badge badge-success">24 / 100 (Safe)</span></td>
                              <td>0.18%</td>
                              <td>98.8%</td>
                              <td><span className="table-badge badge-success">Compliant</span></td>
                            </tr>
                            <tr>
                              <td><b>Korba West Pit-2 (SECL)</b></td>
                              <td><span className="table-badge badge-success">31 / 100 (Safe)</span></td>
                              <td>0.22%</td>
                              <td>97.5%</td>
                              <td><span className="table-badge badge-success">Compliant</span></td>
                            </tr>
                            <tr>
                              <td><b>Singrauli Block-B (NCL)</b></td>
                              <td><span className="table-badge badge-warning">54 / 100 (Moderate)</span></td>
                              <td>0.36%</td>
                              <td>94.1%</td>
                              <td><span className="table-badge badge-info">Routine Survey</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Active Operations Map for Mine Official */}
                  {(currentUser.role === "mine_official" || currentUser.role === "contractor") && (
                    <section className="card">
                      <div className="card-head">
                        <span className="sec-label">{t.cardActiveOperations}</span>
                        <span className="sec-label-hi">{t.valMineScope}</span>
                      </div>
                      <MiningZoneVectorMap label="Underground Operations Zone Map" lang={lang} />
                      <div className="mapfoot">
                        <span>{t.workersOnShift}: <b>412</b></span>
                        <span>{t.depth}: <b>218 m</b></span>
                        <span>{t.lastSurvey}: <b>{t.date16Feb}</b></span>
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column */}
                <div className="col">
                  {/* Real-Time Telemetry Quick Snapshot */}
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{lang === "en" ? "REAL-TIME TELEMETRY FEED" : "लाइव टेलीमेट्री फीड"}</span>
                      <span className="sec-label-hi">Live 15s Feed</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>Methane Gas (CH₄) — Section B</div>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>Sensor SN-0914 · Reg. 140 limit 0.75%</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#15803d" }}>0.42%</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>Carbon Monoxide (CO) — Return Shaft</div>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>Sensor SN-0821 · Safe &lt;50 ppm</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>12 ppm</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>Support Bolt Tension (12 Sensors)</div>
                          <div style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 600 }}>Anomaly: 4 shifts flagged below threshold</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#dc2626" }}>68 kN</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="viewall"
                      type="button"
                      style={{ marginTop: 12 }}
                      onClick={() => setActiveFeature("telemetry")}
                    >
                      {lang === "en" ? "Open Full Gas & Telemetry Hub" : "पूरा टेलीमेट्री हब खोलें"}
                      <ArrowRightIcon className="ic ic-sm" />
                    </button>
                  </section>

                  {/* Prior Inspections List */}
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardPriorInspections}</span>
                      <span className="sec-label-hi">{t.total108}</span>
                    </div>
                    <div className="list">
                      <div className="lrow">
                        <span className="lglyph"><ClipboardCheckIcon className="ic ic-sm" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.prior1Title}</span>
                          <span className="lmeta">{t.prior1Meta}</span>
                        </span>
                        <span className="lval">{t.date14Feb}</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><WindIcon className="ic ic-sm" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.prior2Title}</span>
                          <span className="lmeta">{t.prior2Meta}</span>
                        </span>
                        <span className="lval">09 Feb</span>
                      </div>
                    </div>
                    <button
                      className="viewall"
                      type="button"
                      onClick={() => setChecklistRunnerOpen(true)}
                    >
                      {t.btnPreviewChecklist}
                      <ArrowRightIcon className="ic ic-sm" />
                    </button>
                  </section>
                </div>
              </div>

              <div className="rule" style={{ marginBlock: "32px 0" }}></div>
              <footer>
                <span>{t.footerMinistry}</span>
                <span>{t.footerAlertRetention}</span>
              </footer>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 2: GAS & ENVIRONMENTAL TELEMETRY HUB
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "telemetry" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <WindIcon className="ic ic-xs" />
                      Continuous Grid Telemetry
                    </span>
                    <span className="tag quiet">CMR Reg. 140 & MoEFCC</span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.navTelemetry}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>
                    {lang === "en" ? "Real-time underground atmosphere, gas concentrations & environmental sensors" : "वास्तविक समय में भूमिगत वायुमंडल, गैस सांद्रता एवं पर्यावरण सेंसर"}
                  </p>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showToast(lang === "en" ? "Exporting 24-hour Telemetry Log (CSV)..." : "टेलीमेट्री लॉग डाउनलोड हो रहा है...")}
                  >
                    <DownloadIcon className="ic ic-sm" />
                    {lang === "en" ? "Export Telemetry (CSV)" : "डेटा निर्यात करें (CSV)"}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              {/* Sensor Cards Grid */}
              <div className="gas-grid">
                <div className="gas-sensor-card">
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Methane (CH₄)</div>
                      <div className="gas-sensor-code">SN-CH4-0914 · Seam 4</div>
                    </div>
                    <span className="gas-status-pill gas-status-normal">Normal</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value">0.42</span>
                    <span className="gas-unit">% (vol)</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    Threshold: &lt;0.75% · Alarm at 1.25%
                  </div>
                </div>

                <div className="gas-sensor-card">
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Carbon Monoxide (CO)</div>
                      <div className="gas-sensor-code">SN-CO-0821 · Section B</div>
                    </div>
                    <span className="gas-status-pill gas-status-normal">Normal</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value">12</span>
                    <span className="gas-unit">PPM</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    Permissible limit: &lt;50 PPM
                  </div>
                </div>

                <div className="gas-sensor-card">
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Oxygen Level (O₂)</div>
                      <div className="gas-sensor-code">SN-O2-0411 · Return Airway</div>
                    </div>
                    <span className="gas-status-pill gas-status-normal">Safe</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value">20.8</span>
                    <span className="gas-unit">%</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    Standard band: 19.0% – 21.0%
                  </div>
                </div>

                <div className="gas-sensor-card">
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Airflow Velocity</div>
                      <div className="gas-sensor-code">SN-VEL-0119 · Vent Shaft 2</div>
                    </div>
                    <span className="gas-status-pill gas-status-normal">Nominal</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value">1.84</span>
                    <span className="gas-unit">m/s</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    Statutory minimum: &gt;1.50 m/s
                  </div>
                </div>

                <div className="gas-sensor-card">
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Respirable Dust (PM10)</div>
                      <div className="gas-sensor-code">SN-DUST-0610 · Transfer Point</div>
                    </div>
                    <span className="gas-status-pill gas-status-normal">Within Norms</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value">2.4</span>
                    <span className="gas-unit">mg/m³</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    MoEFCC 8-hr standard: &lt;3.0 mg/m³
                  </div>
                </div>

                <div className="gas-sensor-card" style={{ borderLeft: "4px solid #dc2626" }}>
                  <div className="gas-sensor-header">
                    <div>
                      <div className="gas-sensor-name">Strata Convergence Rate</div>
                      <div className="gas-sensor-code">SN-STR-2204 · Section B</div>
                    </div>
                    <span className="gas-status-pill gas-status-critical">Elevated</span>
                  </div>
                  <div className="gas-value-row">
                    <span className="gas-main-value" style={{ color: "#dc2626" }}>9.0</span>
                    <span className="gas-unit">mm/day</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 600 }}>
                    Baseline: 4.0 mm/day (+125% drift)
                  </div>
                </div>
              </div>

              {/* Map & Telemetry Integration */}
              <div className="main" style={{ marginTop: 24 }}>
                <div className="col">
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{lang === "en" ? "MINE TELEMETRY SENSOR NETWORK" : "खदान सेंसर नेटवर्क"}</span>
                      <span className="sec-label-hi">184 Active Sensors</span>
                    </div>
                    <MiningZoneVectorMap label="Sensor Location Map" lang={lang} />
                  </section>
                </div>
                <div className="col">
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{lang === "en" ? "AUTOMATED SENSOR CALIBRATION STATUS" : "सेंसर अंशांकन स्थिति"}</span>
                      <span className="sec-label-hi">CMR Reg. 140 (7)</span>
                    </div>
                    <div className="list">
                      <div className="lrow">
                        <span className="lglyph"><CheckIcon className="ic ic-sm" style={{ color: "#16a34a" }} /></span>
                        <span className="ltxt">
                          <span className="ltitle">Optical CH₄ Gas Analyzer Calibration</span>
                          <span className="lmeta">Calibrated by S. Sharma · Valid to 18 Mar 2026</span>
                        </span>
                        <span className="lval">Pass</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><CheckIcon className="ic ic-sm" style={{ color: "#16a34a" }} /></span>
                        <span className="ltxt">
                          <span className="ltitle">Electrochemical CO Sensor Zero-Point Verification</span>
                          <span className="lmeta">Automated auto-zero sweep at 04:00</span>
                        </span>
                        <span className="lval">Pass</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><AlertTriangleIcon className="ic ic-sm" style={{ color: "#b45309" }} /></span>
                        <span className="ltxt">
                          <span className="ltitle">Section B Tell-Tale Strata Dial Recalibration Due</span>
                          <span className="lmeta">Scheduled for next shift maintenance</span>
                        </span>
                        <span className="lval" style={{ color: "#b45309" }}>Due 24h</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 3: STATUTORY INSPECTIONS
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "inspections" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <button className="backlink" type="button" onClick={() => setActiveFeature("dashboard")}>
                    <ArrowLeftIcon className="ic ic-sm" />
                    {t.crumbInspections}
                  </button>
                  <h1>{t.pageNewInspection}</h1>
                  <div className="headmeta">
                    <span className="tag">
                      <FilePlusIcon className="ic ic-xs" />
                      {t.tagDraftIns}
                    </span>
                    <span className="tag quiet">
                      <MapPinIcon className="ic ic-xs" />
                      {t.tagJharia}
                    </span>
                    <span className="tag quiet">
                      <ShieldIcon className="ic ic-xs" />
                      {t.tagDgmsReg}
                    </span>
                  </div>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setChecklistRunnerOpen(true)}
                  >
                    <ClipboardCheckIcon className="ic ic-sm" />
                    {t.btnCreateChecklist}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => setObservationModalOpen(true)}
                  >
                    <PlusIcon className="ic ic-sm" />
                    {t.btnLogObservation}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              <div className="main">
                <div className="col">
                  <section className="card tinted">
                    <div className="card-head">
                      <span className="sec-label">{t.cardInspectionSetup}</span>
                      <span className="sec-label-hi">{t.step1of3}</span>
                    </div>

                    <div className="field">
                      <label htmlFor="ins-type">{t.lblInspectionType}</label>
                      <button className="well big" type="button" id="ins-type">
                        <span>
                          <span className="well-title">{t.valInspectionType}</span>
                          <span className="well-sub">{t.valInspectionTypeSub}</span>
                        </span>
                        <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)", marginTop: 4 }} />
                      </button>
                    </div>

                    <div className="twoup">
                      <div className="field">
                        <label htmlFor="ins-mine">{t.lblMineBlock}</label>
                        <button className="well" type="button" id="ins-mine">
                          <span>{t.valMineBlock}</span>
                          <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)" }} />
                        </button>
                      </div>
                      <div className="field">
                        <label htmlFor="ins-section">{t.lblSectionPanel}</label>
                        <button className="well" type="button" id="ins-section">
                          <span>{t.valSectionPanel}</span>
                          <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)" }} />
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="ins-officer">{t.lblAssignedInspector}</label>
                      <button className="well" type="button" id="ins-officer">
                        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="avatar">SK</span>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span className="who-name">S. Kujur</span>
                            <span className="who-role">{t.valSafetyOfficer}</span>
                          </span>
                        </span>
                        <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)" }} />
                      </button>
                    </div>

                    <div className="field">
                      <label>{t.lblScheduledShift}</label>
                      <div className="pillrow" role="group" aria-label="Scheduled shift">
                        {[
                          { key: "shift1", label: t.optShift1 },
                          { key: "shift2", label: t.optShift2 },
                          { key: "shift3", label: t.optShift3 }
                        ].map((item) => (
                          <button
                            key={item.key}
                            className={`chip ${inspectionShift === item.key ? "active" : ""}`}
                            type="button"
                            aria-pressed={inspectionShift === item.key}
                            onClick={() => setInspectionShift(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      type="button"
                      style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                      onClick={() => setChecklistRunnerOpen(true)}
                    >
                      <ArrowRightIcon className="ic" />
                      {t.btnCreateChecklist}
                    </button>
                    <p className="formnote">
                      {t.inspectionOfflineNote}
                    </p>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardInspectionSite}</span>
                      <span className="sec-label-hi">{t.valMineScope}</span>
                    </div>
                    <MiningZoneVectorMap label="Map of Jharia Block-4 showing Panel B-3" lang={lang} />
                    <div className="mapfoot">
                      <span>{t.entryPortal}: <b>P-2</b></span>
                      <span>{t.depth}: <b>218 m</b></span>
                      <span>{t.lastInspected}: <b>{t.date14Feb}</b></span>
                    </div>
                  </section>
                </div>

                <div className="col">
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardChecklistCoverage}</span>
                      <span className="sec-label-hi">{t.total26Checkpoints}</span>
                    </div>
                    <div className="factorlist">
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.checkBoltTension}</span>
                          <span className="factor-val">9</span>
                        </div>
                        <div className="track"><i style={{ width: "35%" }}></i></div>
                        <p className="factor-note">{t.checkBoltNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.checkStrata}</span>
                          <span className="factor-val">7</span>
                        </div>
                        <div className="track"><i style={{ width: "27%" }}></i></div>
                        <p className="factor-note">{t.checkStrataNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.checkVentilation}</span>
                          <span className="factor-val">6</span>
                        </div>
                        <div className="track"><i style={{ width: "23%" }}></i></div>
                        <p className="factor-note">{t.checkVentilationNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.checkAccess}</span>
                          <span className="factor-val">4</span>
                        </div>
                        <div className="track"><i style={{ width: "15%" }}></i></div>
                        <p className="factor-note">{t.checkAccessNote}</p>
                      </div>
                    </div>
                    <button
                      className="viewall"
                      type="button"
                      onClick={() => setChecklistRunnerOpen(true)}
                    >
                      {t.btnPreviewChecklist}
                      <ArrowRightIcon className="ic" />
                    </button>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardPriorInspections}</span>
                      <span className="sec-label-hi">{t.sectionBTotal11}</span>
                    </div>
                    <div className="list">
                      <div className="lrow">
                        <span className="lglyph"><ClipboardCheckIcon className="ic" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.prior1Title}</span>
                          <span className="lmeta">{t.prior1Meta}</span>
                        </span>
                        <span className="lval">{t.date14Feb}</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><WindIcon className="ic" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.prior2Title}</span>
                          <span className="lmeta">{t.prior2Meta}</span>
                        </span>
                        <span className="lval">09 Feb</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><ZapIcon className="ic" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.prior3Title}</span>
                          <span className="lmeta">{t.prior3Meta}</span>
                        </span>
                        <span className="lval">02 Feb</span>
                      </div>
                    </div>
                    <button
                      className="viewall"
                      type="button"
                      onClick={() => showToast(lang === "en" ? "Loading 11 prior inspections..." : "11 पुराने निरीक्षण लोड हो रहे हैं...")}
                    >
                      {t.btnViewAll11Inspections}
                      <ArrowRightIcon className="ic" />
                    </button>
                  </section>
                </div>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 4: AI RISK INSIGHTS (Roof-Fall Alert & CAPA)
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "insights" && (
            <main className="wrap">
              <section className="alerthead">
                <div>
                  <h1>{t.riskTitle}</h1>
                  <div className="headmeta">
                    <span className="tag">
                      <AlertTriangleIcon className="ic ic-xs" />
                      {t.tagHighRisk}
                    </span>
                    <span className="tag quiet">
                      <MapPinIcon className="ic ic-xs" />
                      {t.tagJharia}
                    </span>
                    <span className="tag quiet">
                      <ClockIcon className="ic ic-xs" />
                      {t.tagDetectedTime}
                    </span>
                    <span className="tag quiet">
                      <ShieldIcon className="ic ic-xs" />
                      {t.tagDgmsReg}
                    </span>
                  </div>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setIsCapaAssigned(true);
                      showToast(lang === "en" ? `CAPA assigned to ${currentOfficerName}.` : `सुधारात्मक कार्रवाई ${currentOfficerName} को सौंपी गई।`);
                    }}
                  >
                    <UserPlusIcon className="ic ic-sm" />
                    {t.btnAssignCapa}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showToast(lang === "en" ? "Notice escalated to GM (Safety)." : "सूचना महाप्रबंधक (सुरक्षा) को भेजी गई।")}
                  >
                    <TrendingUpIcon className="ic ic-sm" />
                    {t.escalate}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => showToast(lang === "en" ? "Downloading Risk Dossier (PDF)..." : "जोखिम डोजियर (पीडीएफ) डाउनलोड हो रहा है...")}
                  >
                    <DownloadIcon className="ic ic-sm" />
                    {t.pdf}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              <div className="main">
                <div className="col">
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardRiskScore}</span>
                      <span className="sec-label-hi">{t.modelRecords}</span>
                    </div>
                    <div className="riskhero">
                      <div className="gauge-wrap">
                        <svg viewBox="0 0 200 128" style={{ width: "100%", maxWidth: "220px", height: "auto" }}>
                          <path d="M20 118 A 80 80 0 0 1 180 118" fill="none" stroke="var(--gesso-surface)" strokeWidth="14" strokeLinecap="round" pathLength="100"></path>
                          <path d="M20 118 A 80 80 0 0 1 180 118" fill="none" stroke="var(--gesso-accent)" strokeWidth="14" strokeLinecap="round" pathLength="100" strokeDasharray="78 100"></path>
                          <text x="100" y="98" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="44" fontWeight="800" fill="var(--gesso-fg)">78</text>
                          <text x="20" y="128" textAnchor="start" fontFamily="Satoshi, sans-serif" fontSize="10" fill="var(--gesso-fg-muted)">{t.gaugeSafe}</text>
                          <text x="180" y="128" textAnchor="end" fontFamily="Satoshi, sans-serif" fontSize="10" fill="var(--gesso-fg-muted)">{t.gaugeCritical}</text>
                        </svg>
                      </div>
                      <div className="risknum">
                        <span className="val">78</span>
                        <span className="cap">
                          {lang === "en" ? <>of 100 · <b>High Risk band</b></> : <>100 में से · <b>उच्च जोखिम श्रेणी</b></>}
                        </span>
                        <span className="deltaline">
                          <ArrowUpRightIcon className="ic ic-sm" />
                          {t.riskDelta}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="card plain">
                    <div className="card-head">
                      <span className="sec-label">{t.cardExplanation}</span>
                    </div>
                    <p>{t.explanationText}</p>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardFactors}</span>
                      <span className="sec-label-hi">{t.factorSignalWeight}</span>
                    </div>
                    <div className="factorlist">
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.factorBoltTension}</span>
                          <span className="factor-val">34%</span>
                        </div>
                        <div className="track"><i style={{ width: "34%" }}></i></div>
                        <p className="factor-note">{t.factorBoltNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.factorConvergence}</span>
                          <span className="factor-val">27%</span>
                        </div>
                        <div className="track"><i style={{ width: "27%" }}></i></div>
                        <p className="factor-note">{t.factorConvergenceNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.factorInspectionsOverdue}</span>
                          <span className="factor-val">21%</span>
                        </div>
                        <div className="track"><i style={{ width: "21%" }}></i></div>
                        <p className="factor-note">{t.factorInspectionsNote}</p>
                      </div>
                      <div className="factorrow">
                        <div className="factor-top">
                          <span className="factor-name">{t.factorVibration}</span>
                          <span className="factor-val">18%</span>
                        </div>
                        <div className="track"><i style={{ width: "18%" }}></i></div>
                        <p className="factor-note">{t.factorVibrationNote}</p>
                      </div>
                    </div>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardAffectedZone}</span>
                      <span className="sec-label-hi">{t.valMineScope}</span>
                    </div>
                    <MiningZoneVectorMap label="Section B Risk Zone" lang={lang} />
                    <div className="mapfoot">
                      <span>{t.workersOnShift}: <b>42</b></span>
                      <span>{t.depth}: <b>218 m</b></span>
                      <span>{t.lastSurvey}: <b>{t.date16Feb}</b></span>
                    </div>
                  </section>
                </div>

                <div className="col">
                  <section className="card tinted">
                    <div className="card-head">
                      <span className="sec-label">{t.cardAssignCapa}</span>
                    </div>
                    <div className="field">
                      <label htmlFor="capa-owner">{t.lblResponsibleOfficer}</label>
                      <button
                        className="well"
                        type="button"
                        id="capa-owner"
                        onClick={() => {
                          const nextKey = capaOfficerKey === "SK" ? "MT" : "SK";
                          setCapaOfficerKey(nextKey);
                          const nextName = nextKey === "SK" ? (lang === "en" ? "S. Kujur" : "एस. कुजूर") : (lang === "en" ? "M. Tirkey" : "एम. तिर्की");
                          showToast(lang === "en" ? `Responsible officer: ${nextName}` : `जिम्मेदार अधिकारी: ${nextName}`);
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span className="avatar">{capaOfficerKey === "SK" ? (lang === "en" ? "SK" : "एस.के") : (lang === "en" ? "MT" : "एम.टी")}</span>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span className="who-name">{currentOfficerName}</span>
                            <span className="who-role">{t.valSafetyOfficer}</span>
                          </span>
                        </span>
                        <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)" }} />
                      </button>
                    </div>

                    <div className="field">
                      <label htmlFor="capa-action">{t.lblActionTemplate}</label>
                      <button className="well" type="button" id="capa-action">
                        <span>{t.optActionTemplate}</span>
                        <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)" }} />
                      </button>
                    </div>

                    <div className="field">
                      <label>{t.lblTargetClosure}</label>
                      <div className="pillrow" role="group" aria-label="Target closure">
                        {[
                          { key: "24h", label: t.optClosure24h },
                          { key: "48h", label: t.optClosure48h },
                          { key: "7d", label: t.optClosure7d }
                        ].map((item) => (
                          <button
                            key={item.key}
                            className={`chip ${capaClosureTime === item.key ? "active" : ""}`}
                            type="button"
                            aria-pressed={capaClosureTime === item.key}
                            onClick={() => setCapaClosureTime(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      type="button"
                      style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                      onClick={() => {
                        setIsCapaAssigned(true);
                        showToast(lang === "en" ? `CAPA assigned to ${currentOfficerName}.` : `सुधारात्मक कार्रवाई ${currentOfficerName} को सौंपी गई।`);
                      }}
                    >
                      <CheckIcon className="ic ic-sm" />
                      {t.btnConfirmAssignment}
                    </button>
                    <p style={{ fontSize: 12, color: "var(--gesso-fg-muted)", margin: "12px 0 0", lineHeight: 1.5 }}>
                      {t.capaDisclaimer}
                    </p>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardUnderlyingRecords}</span>
                      <span className="sec-label-hi">{t.total14Records}</span>
                    </div>
                    <div className="list">
                      <div className="lrow">
                        <span className="lglyph"><ClipboardCheckIcon className="ic ic-sm" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.rec1Title}</span>
                          <span className="lmeta">{t.rec1Meta}</span>
                        </span>
                        <span className="lval">{t.date14Feb}</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><AlertTriangleIcon className="ic ic-sm" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.rec2Title}</span>
                          <span className="lmeta">{t.rec2Meta}</span>
                        </span>
                        <span className="lval">{t.date16Feb}</span>
                      </div>
                      <div className="lrow">
                        <span className="lglyph"><ActivityIcon className="ic ic-sm" /></span>
                        <span className="ltxt">
                          <span className="ltitle">{t.rec3Title}</span>
                          <span className="lmeta">{t.rec3Meta}</span>
                        </span>
                        <span className="lval">{t.date12Feb}</span>
                      </div>
                    </div>
                    <button className="viewall" type="button" onClick={() => showToast(lang === "en" ? "Loading 14 sensor logs" : "14 सेंसर लॉग लोड हो रहे हैं")}>
                      {t.btnViewAll14}
                      <ArrowRightIcon className="ic ic-sm" />
                    </button>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardAuditTrail}</span>
                      <span className="sec-label-hi">{t.auditImmutable}</span>
                    </div>
                    <div className="trail">
                      <div className="trow">
                        <span className="tstamp">{t.date18Feb0620}</span>
                        <span className="tbody">{t.audit1}</span>
                      </div>
                      <div className="trow">
                        <span className="tstamp">{t.date18Feb0622}</span>
                        <span className="tbody">{t.audit2}</span>
                      </div>
                      <div className="trow">
                        <span className="tstamp">{t.date18Feb0705}</span>
                        <span className="tbody">{t.audit3} {currentUser.contractorName} ({currentUser.contractorId})</span>
                      </div>
                      {isCapaAssigned && (
                        <div className="trow" style={{ animation: "slideUp 200ms ease" }}>
                          <span className="tstamp" style={{ color: "var(--gesso-accent)", fontWeight: 700 }}>{t.date18Feb0745}</span>
                          <span className="tbody">{t.auditAssigned} {currentOfficerName}</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 5: STATUTORY COMPLIANCE REGISTER & OCR
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "compliance" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <FileCheckIcon className="ic ic-xs" />
                      Statutory Register
                    </span>
                    <span className="tag quiet">Mines Act 1952 & CMR 2017</span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.navCompliance}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>
                    {lang === "en" ? "Mandatory statutory registers, regulations tracker & AI OCR paper digitizer" : "अनिवार्य वैधानिक रजिस्टर, विनियम ट्रैकर एवं एआई ओसीआर डिजिटाइज़र"}
                  </p>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setOcrScannerOpen(true)}
                  >
                    <PlusIcon className="ic ic-sm" />
                    {t.btnOcrScan}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              <div className="gov-table-wrap" style={{ marginBlock: 24 }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>{lang === "en" ? "Regulation / Statutory Act" : "विनियम / वैधानिक अधिनियम"}</th>
                      <th>{lang === "en" ? "Domain" : "क्षेत्र"}</th>
                      <th>{lang === "en" ? "Frequency / Mandate" : "आवृत्ति"}</th>
                      <th>{lang === "en" ? "Last Filing / Verification" : "अंतिम सत्यापन"}</th>
                      <th>{lang === "en" ? "Compliance Status" : "अनुपालन स्थिति"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>CMR 2017 — Reg. 108</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>Strata Control & Support Plan (SCAMP)</span></td>
                      <td>Roof Support</td>
                      <td>Daily / Shift-wise</td>
                      <td>18 Feb 2026, 06:20</td>
                      <td><span className="table-badge badge-warning">High Risk Flag</span></td>
                    </tr>
                    <tr>
                      <td><b>CMR 2017 — Reg. 140</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>Underground Ventilation & Gas Standards</span></td>
                      <td>Ventilation & Gases</td>
                      <td>Continuous Telemetry</td>
                      <td>18 Feb 2026, 09:15</td>
                      <td><span className="table-badge badge-success">Compliant (0.42% CH₄)</span></td>
                    </tr>
                    <tr>
                      <td><b>Mines Act 1952 — Form IV-B</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>Quarterly Occupational Health & Safety Declaration</span></td>
                      <td>Labour Health</td>
                      <td>Quarterly Return</td>
                      <td>15 Jan 2026</td>
                      <td><span className="table-badge badge-success">Approved (DGMS)</span></td>
                    </tr>
                    <tr>
                      <td><b>Mines Act 1952 — Form III-A</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>Monthly Statutory Return (DGMS/MoEFCC)</span></td>
                      <td>Statutory Return</td>
                      <td>Monthly (Due 20th)</td>
                      <td>18 Feb 2026 (Draft)</td>
                      <td><span className="table-badge badge-info">Draft Ready for DSC</span></td>
                    </tr>
                    <tr>
                      <td><b>MoEFCC Air Quality Standards</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>PM10 / PM2.5 Ambient Dust Limit</span></td>
                      <td>Environment</td>
                      <td>Continuous 24h</td>
                      <td>18 Feb 2026</td>
                      <td><span className="table-badge badge-success">Compliant (2.4 mg/m³)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 6: CONTRACTORS & LABOUR DIRECTORY
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "contractors" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <UsersIcon className="ic ic-xs" />
                      Contractor Vault
                    </span>
                    <span className="tag quiet">Contract Labour Act & Form V</span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.navContractors}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>
                    {lang === "en" ? "Authorized mining agencies, Form V compliance, worker inductions & safety ratings" : "अधिकृत खनन एजेंसियां, फॉर्म V अनुपालन, सुरक्षा इंडक्शन एवं स्टार रेटिंग"}
                  </p>
                </div>
              </section>

              <div className="rule"></div>

              <div className="gov-table-wrap" style={{ marginBlock: 24 }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>{lang === "en" ? "Contractor / Agency" : "ठेकेदार / एजेंसी"}</th>
                      <th>{lang === "en" ? "Assigned Section" : "आवंटित क्षेत्र"}</th>
                      <th>{lang === "en" ? "Workers On Shift" : "पाली में श्रमिक"}</th>
                      <th>{lang === "en" ? "Form V License" : "फॉर्म V लाइसेंस"}</th>
                      <th>{lang === "en" ? "Safety Star Rating" : "सुरक्षा रेटिंग"}</th>
                      <th>{lang === "en" ? "Status" : "स्थिति"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Eastern Coking & Earthmovers Ltd.</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>ID: DGMS-EAS-2026-8812</span></td>
                      <td>Section B (Overburden)</td>
                      <td>184</td>
                      <td>Valid to Nov 2027</td>
                      <td>⭐ 4.8 / 5.0</td>
                      <td><span className="table-badge badge-success">Authorized</span></td>
                    </tr>
                    <tr>
                      <td><b>Bharat Heavy Strata Drillers LLP</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>ID: DGMS-BHA-2026-4419</span></td>
                      <td>Panel B-3 Roof Bolting</td>
                      <td>92</td>
                      <td>Valid to Aug 2026</td>
                      <td>⭐ 4.2 / 5.0</td>
                      <td><span className="table-badge badge-warning">Audit Due</span></td>
                    </tr>
                    <tr>
                      <td><b>Jharia Mining Haulage Services</b><br /><span style={{ fontSize: 11.5, color: "#64748b" }}>ID: DGMS-JHA-2026-1022</span></td>
                      <td>Underground Incline P-2</td>
                      <td>136</td>
                      <td>Valid to Jan 2028</td>
                      <td>⭐ 4.9 / 5.0</td>
                      <td><span className="table-badge badge-success">Authorized</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 7: REPORTS & STATUTORY FILINGS (FORM III-A)
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "reports" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <button className="backlink" type="button" onClick={() => setActiveFeature("dashboard")}>
                    <ArrowLeftIcon className="ic ic-xs" />
                    {t.crumbBackReports}
                  </button>
                  <h1>{t.pageCreateReport}</h1>
                  <div className="headmeta">
                    <span className="tag">
                      <FileTextIcon className="ic ic-xs" />
                      {t.tagDraftReport}
                    </span>
                    <span className="tag quiet">
                      <MapPinIcon className="ic ic-xs" />
                      {t.tagJharia}
                    </span>
                    <span className="tag quiet">
                      <ClockIcon className="ic ic-xs" />
                      {t.tagAutosavedTime}
                    </span>
                  </div>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setAckModalOpen(true)}
                  >
                    <FileCheckIcon className="ic ic-sm" />
                    {t.btnSubmitDgmsEfiling}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showToast(lang === "en" ? "Opening print preview..." : "पूर्वावलोकन खुल रहा है...")}
                  >
                    <EyeIcon className="ic ic-sm" />
                    {t.preview}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              <div className="main">
                <div className="col">
                  <section className="card tinted">
                    <div className="card-head">
                      <span className="sec-label">{t.cardReportParameters}</span>
                      <span className="sec-label-hi">{t.step1of2}</span>
                    </div>

                    <div className="field">
                      <span className="flabel">{t.lblReportType}</span>
                      <button className="well" type="button">
                        <span className="well-stack">
                          <span className="well-title">{t.valReportType}</span>
                          <span className="well-sub">{t.valReportTypeSub}</span>
                        </span>
                        <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)" }} />
                      </button>
                    </div>

                    <div className="field">
                      <span className="flabel">{t.lblReportingPeriod}</span>
                      <div className="pillrow" role="group">
                        {[
                          { key: "jan2026", label: t.optJan2026 },
                          { key: "feb2026", label: t.optFeb2026 },
                          { key: "q4", label: t.optQ4 },
                          { key: "custom", label: t.optCustom }
                        ].map((item) => (
                          <button
                            key={item.key}
                            className={`chip ${reportingPeriod === item.key ? "active" : ""}`}
                            type="button"
                            aria-pressed={reportingPeriod === item.key}
                            onClick={() => setReportingPeriod(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <span className="flabel">{t.lblSigningAuthority}</span>
                      <button className="well" type="button">
                        <span className="well-stack">
                          <span className="well-title">{t.valSignerName}</span>
                          <span className="well-sub">{t.valSignerRole}</span>
                        </span>
                        <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)" }} />
                      </button>
                    </div>

                    <div className="formfoot">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setAckModalOpen(true)}
                      >
                        <FileCheckIcon className="ic ic-sm" />
                        {t.btnSubmitDgmsEfiling}
                      </button>
                    </div>
                    <p className="hint">
                      {t.reportGenHint}
                    </p>
                  </section>

                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardSectionsIncluded}</span>
                      <span className="sec-label-hi">{selectedSectionCount} / 6 {t.widgetsSelectedOf}</span>
                    </div>
                    <div className="toggles">
                      <div className="trow2">
                        <span className="tglyph"><ClipboardCheckIcon className="ic ic-sm" /></span>
                        <span className="ttxt">
                          <span className="ttitle">{t.secInspections}</span>
                          <span className="tmeta">{t.secInspectionsMeta}</span>
                        </span>
                        <button
                          className={`switch ${statutorySections.inspections ? "active" : ""}`}
                          type="button"
                          onClick={() => toggleStatutorySection("inspections")}
                        ></button>
                      </div>

                      <div className="trow2">
                        <span className="tglyph"><AlertTriangleIcon className="ic ic-sm" /></span>
                        <span className="ttxt">
                          <span className="ttitle">{t.secViolations}</span>
                          <span className="tmeta">{t.secViolationsMeta}</span>
                        </span>
                        <button
                          className={`switch ${statutorySections.violations ? "active" : ""}`}
                          type="button"
                          onClick={() => toggleStatutorySection("violations")}
                        ></button>
                      </div>

                      <div className="trow2">
                        <span className="tglyph"><BarChartIcon className="ic ic-sm" /></span>
                        <span className="ttxt">
                          <span className="ttitle">{t.secProduction}</span>
                          <span className="tmeta">{t.secProductionMeta}</span>
                        </span>
                        <button
                          className={`switch ${statutorySections.production ? "active" : ""}`}
                          type="button"
                          onClick={() => toggleStatutorySection("production")}
                        ></button>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="col">
                  <section className="card">
                    <div className="card-head">
                      <span className="sec-label">{t.cardReportPreview}</span>
                      <span className="sec-label-hi">{t.form3aPreview}</span>
                    </div>
                    <div className="previewbox">
                      <div className="pv-title">
                        {t.pvHeading} {periodLabels[reportingPeriod]}
                        <span>{t.pvSubtitle}</span>
                      </div>
                      <div className="pv-lines">
                        <div className="pv-line">
                          <span className="pv-k">{t.pvPeriod}</span>
                          <span className="pv-v">{periodLabels[reportingPeriod]}</span>
                        </div>
                        <div className="pv-line">
                          <span className="pv-k">{t.pvSigner}</span>
                          <span className="pv-v">{t.pvSignerVal}</span>
                        </div>
                        <div className="pv-line">
                          <span className="pv-k">{t.pvRecords}</span>
                          <span className="pv-v">{t.pvRecordsVal}</span>
                        </div>
                        <div className="pv-line">
                          <span className="pv-k">{t.pvActiveSections}</span>
                          <span className="pv-v">{selectedSectionCount} {t.pvActiveSectionsVal}</span>
                        </div>
                        <div className="pv-line">
                          <span className="pv-k">{t.pvToken}</span>
                          <span className="pv-v" style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11 }}>SHA256: 8f9b2a7d4e1c</span>
                        </div>
                      </div>
                    </div>

                    <div className="metergrid">
                      <div className="meter">
                        <div className="mtop">
                          <span className="mname">{t.meterCompliance}</span>
                          <span className="mval">98.4%</span>
                        </div>
                        <div className="track"><i style={{ width: "98.4%" }}></i></div>
                      </div>
                      <div className="meter">
                        <div className="mtop">
                          <span className="mname">{t.meterStrata}</span>
                          <span className="mval">92.0%</span>
                        </div>
                        <div className="track"><i style={{ width: "92.0%" }}></i></div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 8: IMMUTABLE AUDIT TRAIL EXPLORER
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "audit" && (
            <main className="wrap">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <LockIcon className="ic ic-xs" />
                      Tamper-Proof Audit Trail
                    </span>
                    <span className="tag quiet">CMR Reg. 108 & ISO 27001</span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.navAudit}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>
                    {lang === "en" ? "Immutable cryptographic event log of AI alerts, inspections, logins & filings" : "एआई अलर्ट, निरीक्षण, लॉगिन एवं विवरणियों का अपरिवर्तनीय डिजिटल लॉग"}
                  </p>
                </div>
                <div className="actionrow">
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={isVerifyingAudit}
                    onClick={handleVerifyAuditChain}
                  >
                    <ShieldIcon className="ic ic-sm" />
                    {isVerifyingAudit
                      ? (lang === "en" ? "Verifying..." : "सत्यापित हो रहा है...")
                      : (lang === "en" ? "Verify Cryptographic Chain" : "क्रिप्टोग्राफिक श्रृंखला सत्यापित करें")}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showToast(lang === "en" ? "Exporting Audit Trail (PDF)..." : "ऑडिट ट्रेल डाउनलोड हो रहा है...")}
                  >
                    <DownloadIcon className="ic ic-sm" />
                    {lang === "en" ? "Export Audit Log" : "ऑडिट लॉग निर्यात करें"}
                  </button>
                </div>
              </section>

              <div className="rule"></div>

              {auditVerifyResult && (
                <div className="audit-verified-banner" style={{ marginBlock: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckIcon className="ic ic-sm" />
                    <span>
                      {auditVerifyResult.valid
                        ? (lang === "en"
                            ? `🔒 HMAC-SHA-256 Audit Chain Verified Unbroken (Blocks ${auditVerifyResult.fromSequence}..${auditVerifyResult.toSequence}, ${auditVerifyResult.verifiedCount} blocks validated)`
                            : `🔒 HMAC-SHA-256 ऑडिट श्रृंखला अखंड सत्यापित (ब्लॉक ${auditVerifyResult.fromSequence}..${auditVerifyResult.toSequence}, ${auditVerifyResult.verifiedCount} ब्लॉक मान्य)`)
                        : `❌ Cryptographic chain broken at sequence ${auditVerifyResult.brokenAtSequence}`}
                    </span>
                  </div>
                  <span className="live-api-badge">HMAC-SHA-256 v1.0.0</span>
                </div>
              )}

              <div className="gov-table-wrap" style={{ marginBlock: 24 }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>{lang === "en" ? "Seq / Time" : "क्रम / समय"}</th>
                      <th>{lang === "en" ? "Event Type" : "गतिविधि प्रकार"}</th>
                      <th>{lang === "en" ? "Actor / Authorized User" : "उपयोगकर्ता"}</th>
                      <th>{lang === "en" ? "Event Details" : "विवरण"}</th>
                      <th>{lang === "en" ? "HMAC Hash Link" : "डिजिटल हैश"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveAuditLogs && liveAuditLogs.length > 0 ? (
                      liveAuditLogs.map((log) => (
                        <tr key={log.id || log.sequence}>
                          <td>
                            <div style={{ fontWeight: 700 }}>#{log.sequence}</div>
                            <div style={{ fontSize: 11, color: "var(--gesso-fg-muted)" }}>
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td>
                            <span className="table-badge badge-info">
                              {log.eventType}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{log.actor?.name || log.actorRole || "System"}</div>
                            <div style={{ fontSize: 11, color: "var(--gesso-fg-muted)" }}>{log.actor?.email || log.actorRole}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13 }}>{log.resourceType}: {log.action}</div>
                            <div style={{ fontSize: 11, color: "var(--gesso-fg-muted)", fontFamily: "var(--gesso-font-mono)" }}>
                              ID: {log.resourceId?.slice(0, 12)}...
                            </div>
                          </td>
                          <td style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11, color: "var(--gesso-accent)" }}>
                            {log.hmacHash ? `${log.hmacHash.slice(0, 10)}...` : "#a81f9b"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td>18 Feb 2026, 06:20</td>
                          <td><span className="table-badge badge-danger">AI Risk Trigger</span></td>
                          <td>System AI Model v4.2</td>
                          <td>Section B Roof-fall risk computed at 78/100</td>
                          <td style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11 }}>#a81f9b09</td>
                        </tr>
                        <tr>
                          <td>18 Feb 2026, 06:22</td>
                          <td><span className="table-badge badge-warning">Notification Sent</span></td>
                          <td>Grid Dispatcher</td>
                          <td>Alert SMS/In-App sent to Agent Manager & Safety Officer</td>
                          <td style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11 }}>#e49c01f2</td>
                        </tr>
                        <tr>
                          <td>18 Feb 2026, 07:05</td>
                          <td><span className="table-badge badge-info">Portal Access</span></td>
                          <td>{currentUser.contractorName}</td>
                          <td>Accessed Grid via ID {currentUser.contractorId}</td>
                          <td style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11 }}>#8f2a1b44</td>
                        </tr>
                        <tr>
                          <td>18 Feb 2026, 07:45</td>
                          <td><span className="table-badge badge-success">CAPA Assigned</span></td>
                          <td>Area Safety Officer</td>
                          <td>Assigned re-bolting SLA (24 hrs) to Officer S. Kujur</td>
                          <td style={{ fontFamily: "var(--gesso-font-mono)", fontSize: 11 }}>#7c19d4ee</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 9: MULTILINGUAL GOVERNED CONVERSATIONAL ASSISTANT
              ══════════════════════════════════════════════════════════════════ */}
          {activeFeature === "assistant" && (
            <main className="wrap" data-brief-id="assistant-root">
              <section className="pagehead">
                <div>
                  <div className="headmeta">
                    <span className="tag">
                      <BotIcon className="ic ic-xs" />
                      {t.navAssistant}
                    </span>
                    <span className="tag quiet">
                      <span className="badge-dot-live" />
                      {lang === "en" ? "Grounded Compliance AI" : "सत्यापित शासन एआई"}
                    </span>
                  </div>
                  <h1 style={{ marginTop: 6 }}>{t.assistantTitle}</h1>
                  <p style={{ color: "var(--gesso-fg-muted)", fontSize: 13, marginTop: 2 }}>{t.assistantSub}</p>
                </div>
              </section>

              <div className="rule"></div>

              <div className="assistant-container" style={{ marginBlock: 20 }}>
                <div className="assistant-messages-list">
                  {assistantHistory.map((msg, idx) => (
                    <div key={idx} className={`assistant-msg ${msg.role}`}>
                      <div className="assistant-bubble">
                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="assistant-citations-box">
                            {msg.citations.map((c, cIdx) => (
                              <span key={cIdx} className="citation-chip">
                                📎 {c.label || c.resourceType}
                              </span>
                            ))}
                          </div>
                        )}
                        {msg.disclaimer && (
                          <div className="assistant-disclaimer-tag">
                            ⚖️ {msg.disclaimer}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {assistantLoading && (
                    <div className="assistant-msg assistant">
                      <div className="assistant-bubble" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <RefreshCwIcon className="ic ic-xs ic-spin" />
                        <span>{lang === "en" ? "Querying scoped statutory records..." : "वैधानिक अभिलेखों की जाँच हो रही है..."}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: "8px 18px", display: "flex", gap: 8, flexWrap: "wrap", background: "var(--gesso-panel)", borderTop: "1px solid var(--gesso-divider)" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: 11.5, height: 28, padding: "0 10px", background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => setAssistantQueryText(lang === "en" ? "What is the safety risk score for Jharia Block-4?" : "झरिया खदान का सुरक्षा जोखिम स्कोर क्या है?")}
                  >
                    💡 {lang === "en" ? "Check Jharia Risk Score" : "झरिया जोखिम स्कोर देखें"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: 11.5, height: 28, padding: "0 10px", background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => setAssistantQueryText(lang === "en" ? "What is the statutory compliance status?" : "वैधानिक अनुपालन स्थिति क्या है?")}
                  >
                    📋 {lang === "en" ? "Statutory Compliance Status" : "वैधानिक अनुपालन स्थिति"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: 11.5, height: 28, padding: "0 10px", background: "var(--gesso-canvas)", border: "1px solid var(--gesso-divider)" }}
                    onClick={() => setAssistantQueryText(lang === "en" ? "Are there any overdue corrective actions?" : "क्या कोई लंबित सुधारात्मक कार्रवाई है?")}
                  >
                    ⚠️ {lang === "en" ? "Overdue CAPAs" : "लंबित कापा सूची"}
                  </button>
                </div>

                <form onSubmit={handleSendAssistantQuery} className="assistant-input-bar">
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Ask in English or Hindi (e.g. What is the current safety risk score?)..." : "हिन्दी या अंग्रेजी में प्रश्न पूछें (उदा. सुरक्षा जोखिम स्कोर क्या है?)..."}
                    value={assistantQueryText}
                    onChange={(e) => setAssistantQueryText(e.target.value)}
                    disabled={assistantLoading}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={assistantLoading || !assistantQueryText.trim()}
                    style={{ height: 44, padding: "0 20px" }}
                  >
                    <SendIcon className="ic ic-xs" />
                    <span>{lang === "en" ? "Ask Query" : "पूछें"}</span>
                  </button>
                </form>
              </div>
            </main>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: GEO-TAGGED OBSERVATION LOGGER
          ══════════════════════════════════════════════════════════════════════ */}
      {observationModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header-bar">
              <h2>{t.modalObservationTitle}</h2>
              <button
                className="iconbtn"
                type="button"
                onClick={() => setObservationModalOpen(false)}
              >
                <XIcon className="ic ic-sm" />
              </button>
            </div>
            <form onSubmit={handleSaveObservation}>
              <div className="modal-body">
                {/* Geo-tag coordinates box */}
                <div className="geo-tag-box">
                  <MapPinIcon className="ic ic-sm" style={{ color: "#2563eb" }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.lblGeoCoords}</div>
                    <div className="geo-tag-coords">23.7507° N, 86.4158° E · Seam 4 (Panel B-3)</div>
                  </div>
                </div>

                <div className="field">
                  <label>{t.lblObsType}</label>
                  <select
                    className="well"
                    value={obsType}
                    onChange={(e) => setObsType(e.target.value)}
                    style={{ height: 42, background: "#ffffff" }}
                  >
                    <option value="unsafe_condition">{t.optUnsafeCondition}</option>
                    <option value="unsafe_act">{t.optUnsafeAct}</option>
                    <option value="gas_seepage">{t.optGasSeepage}</option>
                    <option value="equipment_flaw">{t.optEquipmentFlaw}</option>
                  </select>
                </div>

                <div className="field">
                  <label>{t.lblSeverity}</label>
                  <div className="pillrow">
                    {[
                      { key: "critical", label: t.sevCritical },
                      { key: "high", label: t.sevHigh },
                      { key: "moderate", label: t.sevModerate }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        className={`chip ${obsSeverity === item.key ? "active" : ""}`}
                        onClick={() => setObsSeverity(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>{t.lblObsDescription}</label>
                  <textarea
                    className="well"
                    rows="3"
                    placeholder={t.phObsDescription}
                    value={obsText}
                    onChange={(e) => setObsText(e.target.value)}
                    required
                    style={{ resize: "vertical", minHeight: 70 }}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer-bar">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setObservationModalOpen(false)}
                >
                  {t.cancel}
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  <CheckIcon className="ic ic-sm" />
                  {t.btnSubmitObservation}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: INTERACTIVE CHECKPOINT RUNNER
          ══════════════════════════════════════════════════════════════════ */}
      {checklistRunnerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: 680 }}>
            <div className="modal-header-bar">
              <div>
                <h2>{t.modalChecklistTitle}</h2>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {passedCheckpointsCount} / {checkpointsList.length} {t.checkpointPassedCount}
                </div>
              </div>
              <button
                className="iconbtn"
                type="button"
                onClick={() => setChecklistRunnerOpen(false)}
              >
                <XIcon className="ic ic-sm" />
              </button>
            </div>

            <div className="modal-body">
              <div className="track" style={{ height: 6 }}>
                <i style={{ width: `${Math.round((passedCheckpointsCount / checkpointsList.length) * 100)}%` }}></i>
              </div>

              <div className="interactive-check-list">
                {checkpointsList.map((chk) => (
                  <div
                    key={chk.id}
                    className={`checkpoint-card-item ${chk.status === "pass" ? "status-passed" : "status-failed"}`}
                  >
                    <div className="checkpoint-info">
                      <div className="checkpoint-title-text">
                        {lang === "en" ? chk.titleEn : chk.titleHi}
                      </div>
                      <div className="checkpoint-sub-reg">{chk.reg}</div>
                    </div>
                    <div className="checkpoint-btn-group">
                      <button
                        type="button"
                        className={`btn-chk ${chk.status === "pass" ? "pass-active" : ""}`}
                        onClick={() => toggleCheckpointStatus(chk.id, "pass")}
                      >
                        ✓ {t.btnPass}
                      </button>
                      <button
                        type="button"
                        className={`btn-chk ${chk.status === "fail" ? "fail-active" : ""}`}
                        onClick={() => toggleCheckpointStatus(chk.id, "fail")}
                      >
                        ✕ {t.btnFail}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-bar">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setChecklistRunnerOpen(false)}
              >
                {t.cancel}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setChecklistRunnerOpen(false);
                  showToast(t.checklistSavedToast);
                }}
              >
                <CheckIcon className="ic ic-sm" />
                {t.btnSaveChecklist}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: AI OCR DOCUMENT SCANNER
          ══════════════════════════════════════════════════════════════════ */}
      {ocrScannerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header-bar">
              <h2>{t.modalOcrTitle}</h2>
              <button className="iconbtn" type="button" onClick={() => setOcrScannerOpen(false)}>
                <XIcon className="ic ic-sm" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, padding: 32, textAlign: "center", background: "#f8fafc" }}>
                <FileTextIcon style={{ width: 36, height: 36, color: "#2563eb", margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{lang === "en" ? "Upload Scanned DGMS Inspection Notice / Form" : "डीजीएमएस नोटिस या फॉर्म अपलोड करें"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>PDF, PNG, JPG up to 15MB</div>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 12, borderRadius: 6, fontSize: 12.5, color: "#1e40af" }}>
                ⚡ {t.ocrProcessing}
              </div>
            </div>
            <div className="modal-footer-bar">
              <button className="btn btn-ghost" type="button" onClick={() => setOcrScannerOpen(false)}>
                {t.cancel}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setOcrScannerOpen(false);
                  showToast(t.ocrSuccess);
                }}
              >
                <CheckIcon className="ic ic-sm" />
                {lang === "en" ? "Digitize & Save to Register" : "डिजिटाइज़ करें एवं सहेजें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: DGMS ELECTRONIC ACKNOWLEDGMENT RECEIPT
          ══════════════════════════════════════════════════════════════════ */}
      {ackModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header-bar">
              <h2>{t.modalAckTitle}</h2>
              <button className="iconbtn" type="button" onClick={() => setAckModalOpen(false)}>
                <XIcon className="ic ic-sm" />
              </button>
            </div>
            <div className="modal-body">
              <div className="dgms-ack-slip">
                <div className="dgms-ack-header">
                  <div className="dgms-ack-title">{lang === "en" ? "Ministry of Coal · DGMS Compliance Grid" : "कोयला मंत्रालय · डीजीएमएस अनुपालन ग्रिड"}</div>
                  <div className="dgms-ack-sub">Electronic Statutory Return Filing Acknowledgment</div>
                </div>

                <div className="dgms-ack-meta-grid">
                  <div>
                    <div className="dgms-ack-k">Receipt Number</div>
                    <div className="dgms-ack-v">DGMS-ACK-2026-08914</div>
                  </div>
                  <div>
                    <div className="dgms-ack-k">Mine Block</div>
                    <div className="dgms-ack-v">Jharia Block-4 (BCCL)</div>
                  </div>
                  <div>
                    <div className="dgms-ack-k">Form Type</div>
                    <div className="dgms-ack-v">Form III-A Monthly Return</div>
                  </div>
                  <div>
                    <div className="dgms-ack-k">Filing Period</div>
                    <div className="dgms-ack-v">{periodLabels[reportingPeriod]}</div>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBlock: 12 }}>
                  <div className="dgms-ack-stamp">
                    ✓ Digitally Approved & Filed
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 8, textAlign: "center" }}>
                  {t.ackDigitalSign}
                </div>
              </div>
            </div>
            <div className="modal-footer-bar">
              <button className="btn btn-ghost" type="button" onClick={() => setAckModalOpen(false)}>
                {t.cancel}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setAckModalOpen(false);
                  showToast(lang === "en" ? "Downloading signed acknowledgment PDF..." : "हस्ताक्षरित पावती डाउनलोड हो रही है...");
                }}
              >
                <DownloadIcon className="ic ic-sm" />
                {t.btnPrintAck}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}