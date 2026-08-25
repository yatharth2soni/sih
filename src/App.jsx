import React, { useState, useEffect } from "react";

// ─── COMPREHENSIVE STRICT TRANSLATION DICTIONARY ──────────────────────────────
const i18n = {
  en: {
    appName: "Khanan Suraksha",
    appSubtitle: "Coal Compliance Grid",
    officerName: "R. Mahapatra",
    officerRole: "Compliance Officer",

    // Authentication & Onboarding
    authTitle: "Contractor Safety & Compliance Access",
    authSubtitle: "Directorate General of Mines Safety (DGMS) Portal",
    authPrompt: "Enter your authorized credentials to generate your specific Mining Grid Access ID.",
    lblEmail: "Official Email Address",
    phEmail: "contractor@mininginfra.in",
    lblContractor: "Contractor / Agency Name",
    phContractor: "e.g. Eastern Coking & Earthmovers Ltd.",
    lblPassword: "Password",
    phPassword: "Enter your password",
    lblMineBlockSelect: "Assigned Mine Block",
    btnSubmitAuth: "Generate Contractor ID & Enter Grid",
    authGeneratedIdLbl: "Generated Contractor ID",
    authSecurityNotice: "Statutory requirement under Coal Mines Regulations (CMR Reg. 108). All activities are cryptographically signed and logged.",
    quickDemoFill: "Quick Demo Auto-Fill",
    logout: "Log out",
    contractorBadge: "Contractor ID",
    authPassError: "Please enter your password",
    authEmailError: "Please enter a valid official email",
    authNameError: "Please enter your contractor or organization name",

    // Navigation
    navDashboard: "Dashboard",
    navInspections: "Inspections",
    navInsights: "AI Insights",
    navReports: "Reports",
    navAlerts: "Alerts",
    navDocuments: "Documents",
    navSettings: "Settings",
    navUserManagement: "User Management",
    mainMenu: "MAIN MENU",
    systemMenu: "SYSTEM",
    navCategoryCore: "Main Menu",
    navCategoryStatutory: "Grid Telemetry",
    liveDgmsSync: "Live DGMS Sync",
    dgmsPortal: "DGMS Portal",

    // Dashboard Overview
    dashboardOverview: "Dashboard Overview",
    dashboardSub: "Real-time overview of mining operations and compliance",
    btnCreateDashboardHeader: "Create Dashboard",
    btnCustomize: "Customize",
    kpiRiskScore: "COMPOSITE RISK SCORE",
    kpiModerateRisk: "Moderate Risk",
    kpiOverdueInspections: "OVERDUE INSPECTIONS",
    kpiTotalPending: "Total pending",
    kpiOnShift: "ON SHIFT",
    kpiPersonnel: "Personnel",
    kpiDustLevel: "DUST LEVEL (Avg)",
    kpiWithinLimits: "Within Limits",
    cardRiskTrend: "Risk Trend (Last 7 Days)",
    cardInspectionsStatus: "Inspections Status",
    cardRecentAlerts: "Recent Alerts",
    cardActiveOperations: "Active Operations",
    cardDgmsCompliance: "DGMS Compliance",
    overallCompliance: "Overall Compliance",
    complianceTrend: "from last week",
    opt7Days: "7 Days",
    total108: "Total 108",
    completedLegend: "Completed",
    pendingLegend: "Pending",
    overdueLegend: "Overdue",
    scheduledLegend: "Scheduled",

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

    // Feature 3: New Inspection
    crumbInspections: "Inspections",
    pageNewInspection: "New inspection",
    tagDraftIns: "Draft INS-8907",
    cardInspectionSetup: "Inspection setup",
    step1of3: "Step 1 of 3",
    lblInspectionType: "Inspection type",
    valInspectionType: "Roof support & strata control",
    valInspectionTypeSub: "26 checkpoints",
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
    btnCreateChecklist: "Create & open checklist",
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
    btnPreviewChecklist: "Preview full checklist",
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
    pageCreateReport: "Create report",
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

    // Authentication & Onboarding
    authTitle: "ठेकेदार सुरक्षा एवं अनुपालन प्रवेश",
    authSubtitle: "खान सुरक्षा महानिदेशालय (डीजीएमएस) पोर्टल",
    authPrompt: "अपनी विशिष्ट माइनिंग ग्रिड एक्सेस आईडी जनरेट करने हेतु अधिकृत विवरण दर्ज करें।",
    lblEmail: "आधिकारिक ईमेल पता",
    phEmail: "contractor@mininginfra.in",
    lblContractor: "ठेकेदार / संस्था का नाम",
    phContractor: "उदा. ईस्टर्न कोकिंग एंड अर्थमूवर्स लिमिटेड",
    lblPassword: "पासवर्ड",
    phPassword: "अपना पासवर्ड दर्ज करें",
    lblMineBlockSelect: "आवंटित खदान ब्लॉक",
    btnSubmitAuth: "ठेकेदार आईडी बनाएँ एवं ग्रिड में प्रवेश करें",
    authGeneratedIdLbl: "जनरेट की गई ठेकेदार आईडी",
    authSecurityNotice: "कोयला खान विनियम (सीएमआर विनियम 108) के तहत वैधानिक अनिवार्यता। सभी गतिविधियाँ डिजिटल रूप से हस्ताक्षरित और दर्ज की जाती हैं।",
    quickDemoFill: "डेमो विवरण स्वतः भरें",
    logout: "लॉग आउट",
    contractorBadge: "ठेकेदार आईडी",
    authPassError: "कृपया अपना पासवर्ड दर्ज करें",
    authEmailError: "कृपया वैध आधिकारिक ईमेल दर्ज करें",
    authNameError: "कृपया ठेकेदार या संस्था का नाम दर्ज करें",

    // Navigation
    navDashboard: "डैशबोर्ड",
    navInspections: "निरीक्षण",
    navInsights: "एआई अंतर्दृष्टि",
    navReports: "रिपोर्ट",
    navAlerts: "चेतावनी",
    navDocuments: "दस्तावेज़",
    navSettings: "सेटिंग्स",
    navUserManagement: "उपयोगकर्ता प्रबंधन",
    mainMenu: "मुख्य मेनू",
    systemMenu: "सिस्टम",
    navCategoryCore: "मुख्य मेनू",
    navCategoryStatutory: "ग्रिड टेलीमेट्री",
    liveDgmsSync: "लाइव डीजीएमएस सिंक",
    dgmsPortal: "डीजीएमएस पोर्टल",

    // Dashboard Overview
    dashboardOverview: "डैशबोर्ड अवलोकन",
    dashboardSub: "खनन संचालन और वैधानिक अनुपालन का वास्तविक समय अवलोकन",
    btnCreateDashboardHeader: "डैशबोर्ड बनाएं",
    btnCustomize: "अनुकूलित करें",
    kpiRiskScore: "समग्र जोखिम स्कोर",
    kpiModerateRisk: "मध्यम जोखिम",
    kpiOverdueInspections: "विलंबित निरीक्षण",
    kpiTotalPending: "कुल लंबित",
    kpiOnShift: "पाली में कार्यरत",
    kpiPersonnel: "कार्मिक",
    kpiDustLevel: "धूल स्तर (औसत)",
    kpiWithinLimits: "सुरक्षित सीमा में",
    cardRiskTrend: "जोखिम प्रवृत्ति (पिछले 7 दिन)",
    cardInspectionsStatus: "निरीक्षण स्थिति",
    cardRecentAlerts: "हाल की चेतावनियां",
    cardActiveOperations: "सक्रिय संचालन",
    cardDgmsCompliance: "डीजीएमएस अनुपालन",
    overallCompliance: "समग्र अनुपालन",
    complianceTrend: "पिछले सप्ताह से",
    opt7Days: "7 दिन",
    total108: "कुल 108",
    completedLegend: "पूर्ण",
    pendingLegend: "लंबित",
    overdueLegend: "अतिदेय",
    scheduledLegend: "अनुसूचित",

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

    // Feature 1: AI Risk Insights (Roof-Fall Alert)
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

    // Feature 3: New Inspection
    crumbInspections: "निरीक्षण",
    pageNewInspection: "नया निरीक्षण दर्ज करें",
    tagDraftIns: "मसौदा INS-8907",
    cardInspectionSetup: "निरीक्षण विवरण",
    step1of3: "चरण 1/3",
    lblInspectionType: "निरीक्षण प्रकार",
    valInspectionType: "छत-सहारा एवं स्ट्रेटा नियंत्रण",
    valInspectionTypeSub: "26 चेकपॉइंट",
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
    btnCreateChecklist: "बनाएँ और चेकलिस्ट खोलें",
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
    btnPreviewChecklist: "पूरी चेकलिस्ट देखें",
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
    pageCreateReport: "नई रिपोर्ट बनाएँ",
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

    // Map labels
    mapSecB: "सेक्शन बी",
    mapPanelB3: "पैनल बी-3",
    mapVent2: "वेंट शाफ्ट 2"
  }
};

// Helper function to generate a specific contractor compliance ID
function generateSpecificContractorId(contractorName, email) {
  const cleanName = (contractorName || "CTR").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const prefix = cleanName.length >= 3 ? cleanName.substring(0, 3) : "CON";
  const numHash = Math.floor(1000 + Math.random() * 9000);
  const year = 2026;
  return `DGMS-${prefix}-${year}-${numHash}`;
}

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

function ClipboardCheckIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14l2 2l4-4" />
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

function FileTextIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8" />
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

function ArrowUpRightIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M7 7h10v10M7 17L17 7" />
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

function ChevronDownIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m6 9l6 6l6-6" />
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

function LogOutIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
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

function FolderIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function CalendarIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function SparklesGridIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
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

function SlidersIcon({ className = "ic", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="4" x2="20" y1="21" y2="21" />
      <line x1="4" x2="20" y1="14" y2="14" />
      <line x1="4" x2="20" y1="7" y2="7" />
      <circle cx="8" cy="7" r="2" fill="var(--gesso-canvas)" />
      <circle cx="16" cy="14" r="2" fill="var(--gesso-canvas)" />
      <circle cx="10" cy="21" r="2" fill="var(--gesso-canvas)" />
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

// ─── Main Application Component ───────────────────────────────────────────────
export default function App() {
  // Pre-load Authentication State
  const [currentUser, setCurrentUser] = useState(null); // { email, contractorName, contractorId }
  const [authEmail, setAuthEmail] = useState("");
  const [authContractorName, setAuthContractorName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMineBlock, setAuthMineBlock] = useState("Jharia Block-4");
  const [authError, setAuthError] = useState("");

  const [activeFeature, setActiveFeature] = useState("dashboard"); // "dashboard" | "insights" | "inspections" | "reports"
  const [lang, setLang] = useState("en"); // "en" | "hi"
  const [toastMessage, setToastMessage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Active translation lookup
  const t = i18n[lang];

  useEffect(() => {
    document.title = `${t.appName} — ${t.appSubtitle}`;
  }, [lang, t]);

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

  // Pre-load authentication submission handler
  const handleAuthSubmit = (e) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (!authEmail.trim()) {
      setAuthError(t.authEmailError);
      return;
    }
    if (!authContractorName.trim()) {
      setAuthError(t.authNameError);
      return;
    }
    if (!authPassword.trim()) {
      setAuthError(t.authPassError);
      return;
    }

    const generatedId = generateSpecificContractorId(authContractorName, authEmail);
    const userSession = {
      email: authEmail.trim(),
      contractorName: authContractorName.trim(),
      contractorId: generatedId,
      mineBlock: authMineBlock,
      loggedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setCurrentUser(userSession);
    showToast(
      lang === "en"
        ? `Access granted. Contractor ID: ${generatedId}`
        : `प्रवेश स्वीकृत। ठेकेदार आईडी: ${generatedId}`
    );
  };

  const handleQuickDemoFill = () => {
    setAuthEmail("r.singh@easterncoking.in");
    setAuthContractorName("Eastern Coking & Earthmovers Ltd.");
    setAuthPassword("DGMS@Secured#2026");
    setAuthError("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthPassword("");
    showToast(lang === "en" ? "Logged out successfully." : "सफलतापूर्वक लॉग आउट हो गया।");
  };

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
  // 1. PRE-LOAD AUTHENTICATION SCREEN (Asks for email, contractor name, password)
  // ════════════════════════════════════════════════════════════════════════════
  if (!currentUser) {
    const previewId = authContractorName.trim()
      ? `DGMS-${authContractorName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "CTR"}-2026-••••`
      : "DGMS-CON-2026-••••";

    return (
      <div className="auth-fullscreen-bg">
        {/* Language switch on top right */}
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

        {/* Toast Notice during Auth */}
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

              {/* Field 2: Contractor Name */}
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

              {/* Specific Generated ID Live Preview */}
              <div className="auth-id-preview-box">
                <div className="auth-id-preview-label">{t.authGeneratedIdLbl}</div>
                <div className="auth-id-preview-val">{previewId}</div>
                <div className="auth-id-preview-hint">
                  {lang === "en"
                    ? "A tamper-proof unique cryptographic ID will be assigned to your organization on entry."
                    : "प्रवेश पर आपकी संस्था को एक अपरिवर्तनीय डिजिटल पहचान क्रमांक आवंटित किया जाएगा।"}
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

              {/* Quick Auto-fill button */}
              <button
                className="btn btn-ghost"
                type="button"
                style={{ width: "100%", justifyContent: "center", fontSize: 13, color: "var(--gesso-accent)" }}
                onClick={handleQuickDemoFill}
              >
                ⚡ {t.quickDemoFill}
              </button>
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
  // 2. MAIN COMPLIANCE APPLICATION (Rendered after contractor ID generation)
  // ════════════════════════════════════════════════════════════════════════════
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
        {/* Brand / Logo */}
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
          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileMenuOpen(false)}
          >
            <XIcon className="ic ic-sm" />
          </button>
        </div>

        {/* Contractor / Mine Context Card */}
        {!sidebarCollapsed && (
          <div className="sidebar-profile-card">
            <div className="sidebar-contractor-name" title={currentUser.contractorName}>
              {currentUser.contractorName}
            </div>
            <div className="sidebar-meta-row">
              <span className="sidebar-badge-id">
                <span className="contractor-dot" />
                {currentUser.contractorId}
              </span>
            </div>
            <div className="sidebar-location-sub">
              <span>{currentUser.mineBlock ? `${currentUser.mineBlock.replace("Block-4", "Coalfield, Block-4")}` : "Jharia Coalfield, Block-4"}</span>
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
              {t.mainMenu || (lang === "en" ? "MAIN MENU" : "मुख्य मेनू")}
            </div>
          )}

          <nav className="sidebar-navlinks" aria-label="Dashboard Navigation">
            {/* Nav Item: Dashboard */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "dashboard" ? "active" : ""}`}
              aria-current={activeFeature === "dashboard" ? "page" : undefined}
              title={t.navDashboard}
              onClick={() => { setActiveFeature("dashboard"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon">
                <HomeIcon className="ic ic-sm" />
              </span>
              {!sidebarCollapsed && (
                <span className="sidebar-nav-label-wrap">
                  <span className="sidebar-nav-title">{t.navDashboard}</span>
                </span>
              )}
              {!sidebarCollapsed && activeFeature === "dashboard" && (
                <span className="sidebar-active-indicator" />
              )}
            </button>

            {/* Nav Item: Inspections */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "inspections" ? "active" : ""}`}
              aria-current={activeFeature === "inspections" ? "page" : undefined}
              title={t.navInspections}
              onClick={() => { setActiveFeature("inspections"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon">
                <ClipboardCheckIcon className="ic ic-sm" />
              </span>
              {!sidebarCollapsed && (
                <span className="sidebar-nav-label-wrap">
                  <span className="sidebar-nav-title">{t.navInspections}</span>
                </span>
              )}
              {!sidebarCollapsed && (
                <span className="sidebar-item-badge badge-warning">12</span>
              )}
              {!sidebarCollapsed && activeFeature === "inspections" && (
                <span className="sidebar-active-indicator" />
              )}
            </button>

            {/* Nav Item: AI Insights */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "insights" ? "active" : ""}`}
              aria-current={activeFeature === "insights" ? "page" : undefined}
              title={t.navInsights}
              onClick={() => { setActiveFeature("insights"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon">
                <ActivityIcon className="ic ic-sm" />
              </span>
              {!sidebarCollapsed && (
                <span className="sidebar-nav-label-wrap">
                  <span className="sidebar-nav-title">{t.navInsights}</span>
                </span>
              )}
              {!sidebarCollapsed && (
                <span className="sidebar-item-badge badge-danger">24</span>
              )}
              {!sidebarCollapsed && activeFeature === "insights" && (
                <span className="sidebar-active-indicator" />
              )}
            </button>

            {/* Nav Item: Reports */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeFeature === "reports" ? "active" : ""}`}
              aria-current={activeFeature === "reports" ? "page" : undefined}
              title={t.navReports}
              onClick={() => { setActiveFeature("reports"); setMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon">
                <FileTextIcon className="ic ic-sm" />
              </span>
              {!sidebarCollapsed && (
                <span className="sidebar-nav-label-wrap">
                  <span className="sidebar-nav-title">{t.navReports}</span>
                </span>
              )}
              {!sidebarCollapsed && activeFeature === "reports" && (
                <span className="sidebar-active-indicator" />
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Lang Switcher, User & Actions */}
        <div className="sidebar-footer">
          {/* Language Switcher & Collapse button */}
          <div className="sidebar-lang-switch">
            <div className="langtoggle" role="group" aria-label="Language Selector">
              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                aria-pressed={lang === "en"}
                onClick={() => { setLang("en"); showToast("Language switched to English"); }}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === "hi" ? "active" : ""}
                aria-pressed={lang === "hi"}
                onClick={() => { setLang("hi"); showToast("भाषा बदलकर हिन्दी कर दी गई है"); }}
              >
                HI
              </button>
            </div>

            {/* Desktop Sidebar Collapse Button */}
            <button
              type="button"
              className="sidebar-collapse-btn"
              title={sidebarCollapsed ? (lang === "en" ? "Expand sidebar" : "विस्तार करें") : (lang === "en" ? "Collapse sidebar" : "समेटें")}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <PanelToggleIcon collapsed={sidebarCollapsed} />
            </button>
          </div>

          {/* User Profile Mini Bar & Logout */}
          <div className="sidebar-user-block">
            <div className="sidebar-user-avatar" title={currentUser.contractorName}>
              {currentUser.contractorName ? currentUser.contractorName.charAt(0).toUpperCase() : "E"}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{currentUser.contractorName}</div>
                <div className="sidebar-user-role">{currentUser.contractorId}</div>
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
              {activeFeature === "insights" && t.navInsights}
              {activeFeature === "inspections" && t.navInspections}
              {activeFeature === "reports" && t.navReports}
            </h1>

            <div className="topbar-live-badge">
              <span className="badge-dot-live" />
              <span>{t.liveDgmsSync || (lang === "en" ? "Live DGMS Sync" : "लाइव डीजीएमएस सिंक")}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* DGMS Portal Pill Button */}
            <button
              className="topbar-dgms-btn"
              type="button"
              onClick={() => showToast(lang === "en" ? "Connecting to DGMS Central Compliance Portal..." : "डीजीएमएस केंद्रीय अनुपालन पोर्टल से जुड़ रहा है...")}
            >
              <span className="portal-diamond">✦</span>
              <span>{t.dgmsPortal || "DGMS Portal"}</span>
              <ExternalLinkIcon className="ic ic-xs" />
            </button>

            {/* Notification Popover Button */}
            <div className="popover-wrapper">
              <button
                className="iconbtn topbar-bell-btn"
                type="button"
                aria-label="Notifications"
                onClick={() => { setNotificationsOpen(!notificationsOpen); setSettingsOpen(false); }}
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

            {/* Settings Popover Button */}
            <div className="popover-wrapper">
              <button
                className="iconbtn"
                type="button"
                aria-label="Settings"
                onClick={() => { setSettingsOpen(!settingsOpen); setNotificationsOpen(false); }}
              >
                <SettingsIcon style={{ maxWidth: 32, maxHeight: 32 }} />
              </button>

              {settingsOpen && (
                <div className="popover-menu" role="menu">
                  <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid var(--gesso-divider)", fontWeight: 700, fontSize: "12px", color: "var(--gesso-fg)" }}>
                    {lang === "en" ? "Contractor Session Info" : "ठेकेदार सत्र विवरण"}
                  </div>
                  <div style={{ padding: "8px", fontSize: "12px", color: "var(--gesso-fg-muted)" }}>
                    <div style={{ fontWeight: 700, color: "var(--gesso-fg)" }}>{currentUser.contractorName}</div>
                    <div style={{ marginTop: 2 }}>{currentUser.email}</div>
                    <div style={{ marginTop: 4, fontFamily: "var(--gesso-font-mono)", color: "var(--gesso-accent)" }}>{currentUser.contractorId}</div>
                    <div style={{ marginTop: 2 }}>{currentUser.mineBlock || "Jharia Block-4"}</div>
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

            {/* Quick Profile Info */}
            <div className="who">
              <span className="who-name">{currentUser.contractorName}</span>
              <span className="who-role">{currentUser.contractorId}</span>
            </div>
          </div>
        </header>

        {/* ── Toast Notification ── */}
        {toastMessage && (
          <div className="toast-notice" role="status">
            <CheckIcon className="ic ic-sm" style={{ color: "var(--gesso-success)" }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Scrollable Dashboard Content Views ── */}
        <div className="dashboard-content-area">

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 1: AI RISK INSIGHTS (Roof-Fall Alert & CAPA Assignment)
          ══════════════════════════════════════════════════════════════════════ */}
      {activeFeature === "insights" && (
        <main className="wrap" data-brief-id="screen-root" data-brief-role="screen">
          <section className="alerthead" data-brief-id="alert-header" data-brief-role="header">
            <div>
              <h1>{t.riskTitle}</h1>
              <div className="headmeta">
                <span className="tag">
                  <AlertTriangleIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagHighRisk}
                </span>
                <span className="tag quiet">
                  <MapPinIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagJharia}
                </span>
                <span className="tag quiet">
                  <ClockIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDetectedTime}
                </span>
                <span className="tag quiet">
                  <ShieldIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDgmsReg}
                </span>
              </div>
            </div>
            <div className="actionrow" data-brief-id="alert-actions" data-brief-role="cta">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setIsCapaAssigned(true);
                  showToast(lang === "en" ? `CAPA assigned to ${currentOfficerName}.` : `सुधारात्मक कार्रवाई ${currentOfficerName} को सौंपी गई।`);
                }}
              >
                <UserPlusIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.btnAssignCapa}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => showToast(lang === "en" ? "Notice escalated to GM (Safety)." : "सूचना महाप्रबंधक (सुरक्षा) को भेजी गई।")}
              >
                <TrendingUpIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.escalate}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => showToast(lang === "en" ? "Downloading Risk Dossier (PDF)..." : "जोखिम डोजियर (पीडीएफ) डाउनलोड हो रहा है...")}
              >
                <DownloadIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.pdf}
              </button>
            </div>
          </section>

          <div className="rule"></div>

          <div className="main">
            {/* Left Column: Risk Score, Explanation, Contributing Factors, Map */}
            <div className="col">
              {/* Composite Risk Score Hero Card */}
              <section className="card" data-brief-id="risk-hero" data-brief-role="hero">
                <div className="card-head">
                  <span className="sec-label">{t.cardRiskScore}</span>
                  <span className="sec-label-hi">{t.modelRecords}</span>
                </div>
                <div className="riskhero">
                  <div className="gauge-wrap">
                    <svg data-viz="risk-gauge" viewBox="0 0 200 128" style={{ width: "100%", maxWidth: "220px", height: "auto" }} role="img" aria-label="Risk score 78 out of 100">
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
                      {lang === "en" ? (
                        <>of 100 · <b>High Risk band</b></>
                      ) : (
                        <>100 में से · <b>उच्च जोखिम श्रेणी</b></>
                      )}
                    </span>
                    <span className="deltaline">
                      <ArrowUpRightIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                      {t.riskDelta}
                    </span>
                  </div>
                </div>
              </section>

              {/* Plain Language Explanation */}
              <section className="card plain" data-brief-id="plain-explanation" data-brief-role="section">
                <div className="card-head">
                  <span className="sec-label">{t.cardExplanation}</span>
                </div>
                <p>{t.explanationText}</p>
              </section>

              {/* Contributing Telemetry Factors */}
              <section className="card" data-brief-id="contributing-factors" data-brief-role="chart">
                <div className="card-head">
                  <span className="sec-label">{t.cardFactors}</span>
                  <span className="sec-label-hi">{t.factorSignalWeight}</span>
                </div>
                <div className="factorlist" data-viz="factor-bars">
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

              {/* Affected Mine Zone Geo-Map */}
              <section className="card" data-brief-id="risk-zone-map" data-brief-role="viz">
                <div className="card-head">
                  <span className="sec-label">{t.cardAffectedZone}</span>
                  <span className="sec-label-hi">{t.valMineScope}</span>
                </div>
                <MiningZoneVectorMap label="Map of Jharia Block-4 showing Section B roof-fall risk zone" lang={lang} />
                <div className="mapfoot">
                  <span>{t.workersOnShift}: <b>42</b></span>
                  <span>{t.depth}: <b>218 {lang === "en" ? "m" : "मीटर"}</b></span>
                  <span>{t.lastSurvey}: <b>{t.date16Feb}</b></span>
                </div>
              </section>
            </div>

            {/* Right Column: Assign CAPA, Underlying Evidence, Audit Trail */}
            <div className="col">
              {/* Corrective Action Assignment Form */}
              <section className="card tinted" data-brief-id="capa-assign" data-brief-role="form">
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
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>
                <div className="field">
                  <label htmlFor="capa-action">{t.lblActionTemplate}</label>
                  <button className="well" type="button" id="capa-action">
                    <span>{t.optActionTemplate}</span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
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
                  style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
                  onClick={() => {
                    setIsCapaAssigned(true);
                    showToast(lang === "en" ? `CAPA assigned to ${currentOfficerName}.` : `सुधारात्मक कार्रवाई ${currentOfficerName} को सौंपी गई।`);
                  }}
                >
                  <CheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.btnConfirmAssignment}
                </button>
                <p style={{ fontSize: "12px", color: "var(--gesso-fg-muted)", margin: "12px 0 0", lineHeight: 1.5 }}>
                  {t.capaDisclaimer}
                </p>
              </section>

              {/* Underlying Sensor Evidence Records */}
              <section className="card" data-brief-id="evidence-records" data-brief-role="list">
                <div className="card-head">
                  <span className="sec-label">{t.cardUnderlyingRecords}</span>
                  <span className="sec-label-hi">{t.total14Records}</span>
                </div>
                <div className="list">
                  <div className="lrow">
                    <span className="lglyph"><ClipboardCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.rec1Title}</span>
                      <span className="lmeta">{t.rec1Meta}</span>
                    </span>
                    <span className="lval">{t.date14Feb}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><AlertTriangleIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.rec2Title}</span>
                      <span className="lmeta">{t.rec2Meta}</span>
                    </span>
                    <span className="lval">{t.date16Feb}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><ActivityIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.rec3Title}</span>
                      <span className="lmeta">{t.rec3Meta}</span>
                    </span>
                    <span className="lval">{t.date12Feb}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><FileTextIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.rec4Title}</span>
                      <span className="lmeta">{t.rec4Meta}</span>
                    </span>
                    <span className="lval">{t.date16Feb}</span>
                  </div>
                </div>
                <button className="viewall" type="button" onClick={() => showToast(lang === "en" ? "Loading 14 sensor logs" : "14 सेंसर लॉग लोड हो रहे हैं")}>
                  {t.btnViewAll14}
                  <ArrowRightIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                </button>
              </section>

              {/* Immutable DGMS Audit Trail */}
              <section className="card" data-brief-id="audit-trail" data-brief-role="section">
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
                  <div className="trow">
                    <span className="tstamp">{t.date18Feb0711}</span>
                    <span className="tbody">{t.audit4}</span>
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

          <div className="rule" style={{ marginBlock: "32px 0" }}></div>
          <footer>
            <span>{t.footerMinistry}</span>
            <span>{t.footerAlertRetention}</span>
          </footer>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 2: MINE DASHBOARD BUILDER (Create Dashboard)
          ══════════════════════════════════════════════════════════════════════ */}
      {activeFeature === "dashboard" && (
        <main className="wrap" data-brief-id="section-create-dashboard" data-brief-role="section">
          <section className="pagehead" data-brief-id="page-header" data-brief-role="header">
            <div>
              <p className="crumb">
                <button className="backlink" type="button" onClick={() => setActiveFeature("insights")}>
                  <ArrowLeftIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.crumbBackDashboard || (lang === "en" ? "Back to Dashboard" : "डैशबोर्ड पर वापस")}
                </button>
              </p>
              <h1>{t.pageCreateDashboard || (lang === "en" ? "Create dashboard" : "डैशबोर्ड बनाएं")}</h1>
              <div className="headmeta">
                <span className="tag">
                  <LayoutDashboardIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagNewView || (lang === "en" ? "New view" : "नया दृश्य")}
                </span>
                <span className="tag quiet">
                  <UserIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagOwner || (lang === "en" ? "Owner" : "स्वामी")} {currentUser.contractorName}
                </span>
                <span className="tag quiet">
                  <ClockIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDraftSaved || (lang === "en" ? "Draft saved 09:14" : "मसौदा सहेजा गया 09:14")}
                </span>
              </div>
            </div>
            <div className="actionrow" data-brief-id="header-actions" data-brief-role="cta">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => showToast(lang === "en" ? `Dashboard "${dashboardTitle || t.dashboardDefaultTitle || "Block-4 Safety"}" created.` : `डैशबोर्ड "${dashboardTitle || t.dashboardDefaultTitle || "Block-4 Safety"}" बनाया गया।`)}
              >
                <CheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.btnCreateDashboard || (lang === "en" ? "Create dashboard" : "डैशबोर्ड बनाएं")}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => showToast(lang === "en" ? "Rendering grid preview..." : "ग्रिड पूर्वावलोकन तैयार हो रहा है...")}
              >
                <EyeIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.preview || "Preview"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setActiveFeature("insights")}
              >
                {t.cancel || "Cancel"}
              </button>
            </div>
          </section>

          <div className="rule"></div>

          <div className="main">
            {/* Left Column: Dashboard Setup & Selected Scope */}
            <div className="col">
              <section className="card" data-brief-id="dashboard-setup" data-brief-role="form">
                <div className="card-head">
                  <span className="sec-label">{t.cardDashboardDefinition || "DASHBOARD DEFINITION"}</span>
                  <span className="sec-label-hi">{t.step1of2 || "Step 1 of 2"}</span>
                </div>

                <div className="namewrap" style={{ marginBottom: "32px" }}>
                  <span className="nameval">{dashboardTitle || t.dashboardDefaultTitle || "Block-4 Safety"}</span>
                  <span className="namecap">
                    {t.workingTitleSub || "Working title · visible to 6 officers"}
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="db-name">{t.lblDashboardName || "Dashboard name"}</label>
                  <input
                    className="well"
                    id="db-name"
                    type="text"
                    placeholder={t.dashboardDefaultTitle || "Block-4 Safety"}
                    value={dashboardTitle}
                    onChange={(e) => setDashboardTitle(e.target.value)}
                    aria-describedby="db-name-hint"
                  />
                  <span className="field-hint" id="db-name-hint">
                    {t.dashboardNameHint || "Appears in the sidebar and on exported reports."}
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="db-scope">{t.lblMineScope || "Mine scope"}</label>
                  <button className="well" type="button" id="db-scope">
                    <span>{t.valMineScope || "Jharia Coalfield · Block-4"}</span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="field">
                  <label htmlFor="db-audience">{t.lblVisibleRole || "Visible to role"}</label>
                  <button className="well" type="button" id="db-audience">
                    <span>{t.valVisibleRole || "Mine Officials & Registered Contractors"}</span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="field">
                  <label>{t.lblRefreshInterval || "Refresh interval"}</label>
                  <div className="pillrow" role="group" aria-label="Refresh interval">
                    {[
                      { key: "live", label: t.optLive || "Live" },
                      { key: "15min", label: t.opt15min || "15 min" },
                      { key: "pershift", label: t.optPerShift || "Per shift" },
                      { key: "daily", label: t.optDaily || "Daily" }
                    ].map((item) => (
                      <button
                        key={item.key}
                        className={`chip ${refreshInterval === item.key ? "active" : ""}`}
                        type="button"
                        aria-pressed={refreshInterval === item.key}
                        onClick={() => setRefreshInterval(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="card" data-brief-id="scope-map" data-brief-role="viz">
                <div className="card-head">
                  <span className="sec-label">{t.cardSelectedScope || "SELECTED SCOPE"}</span>
                  <span className="sec-label-hi">{t.valMineScope || "Jharia Coalfield · Block-4"}</span>
                </div>
                <MiningZoneVectorMap label="Map of Jharia Block-4 showing the pit head and panels included in this dashboard scope" lang={lang} />
                <div className="mapfoot">
                  <span>{t.panelsIncluded || "Panels included"}: <b>7</b></span>
                  <span>{t.activeSensors || "Active sensors"}: <b>184</b></span>
                  <span>{t.shiftCrews || "Shift crews"}: <b>3</b></span>
                </div>
              </section>
            </div>

            {/* Right Column: Add Widgets & Layout Preview */}
            <div className="col">
              <section className="card tinted" data-brief-id="widget-picker" data-brief-role="list">
                <div className="card-head">
                  <span className="sec-label">{t.cardAddWidgets || "ADD WIDGETS"}</span>
                  <span className="sec-label-hi">{selectedWidgetCount} / 6 {t.widgetsSelectedOf || "selected"}</span>
                </div>
                <div className="list">
                  <div className="lrow">
                    <span className="lglyph"><ActivityIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetRisk || "Composite risk score"}</span>
                      <span className="lmeta">{t.widgetRiskMeta || "Updated per shift"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.risk ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.risk}
                      onClick={() => toggleWidgetSelection("risk")}
                    >
                      {activeWidgets.risk ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>

                  <div className="lrow">
                    <span className="lglyph"><ClipboardCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetOverdue || "Overdue inspections"}</span>
                      <span className="lmeta">{t.widgetOverdueMeta || "DGMS Reg. 108"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.inspections ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.inspections}
                      onClick={() => toggleWidgetSelection("inspections")}
                    >
                      {activeWidgets.inspections ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>

                  <div className="lrow">
                    <span className="lglyph"><UsersIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetAttendance || "Shift attendance"}</span>
                      <span className="lmeta">{t.widgetAttendanceMeta || "Biometric feed"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.attendance ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.attendance}
                      onClick={() => toggleWidgetSelection("attendance")}
                    >
                      {activeWidgets.attendance ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>

                  <div className="lrow">
                    <span className="lglyph"><WindIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetVentilation || "Ventilation & dust index"}</span>
                      <span className="lmeta">{t.widgetVentilationMeta || "MoEFCC Compliance"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.ventilation ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.ventilation}
                      onClick={() => toggleWidgetSelection("ventilation")}
                    >
                      {activeWidgets.ventilation ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>

                  <div className="lrow">
                    <span className="lglyph"><TruckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetDespatch || "Daily despatch tonnage"}</span>
                      <span className="lmeta">{t.widgetDespatchMeta || "Weighbridge telemetry"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.despatch ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.despatch}
                      onClick={() => toggleWidgetSelection("despatch")}
                    >
                      {activeWidgets.despatch ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>

                  <div className="lrow">
                    <span className="lglyph"><FileTextIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.widgetFiling || "Statutory filing tracker"}</span>
                      <span className="lmeta">{t.widgetFilingMeta || "4 due this month"}</span>
                    </span>
                    <button
                      className={`addbtn ${activeWidgets.filing ? "active" : ""}`}
                      type="button"
                      aria-pressed={activeWidgets.filing}
                      onClick={() => toggleWidgetSelection("filing")}
                    >
                      {activeWidgets.filing ? <CheckIcon className="ic ic-sm" /> : <PlusIcon className="ic ic-sm" />}
                    </button>
                  </div>
                </div>
              </section>

              <section className="card" data-brief-id="layout-preview" data-brief-role="section">
                <div className="card-head">
                  <span className="sec-label">{t.cardLayoutPreview || "LAYOUT PREVIEW"}</span>
                  <span className="sec-label-hi">{t.sampleDataDate || "Sample data · 18 Feb"}</span>
                </div>
                <div className="preview">
                  <div className="pcell">
                    <span className="pval">78</span>
                    <span className="plabel">{t.metricRiskScore || "RISK SCORE"}</span>
                  </div>
                  <div className="pcell">
                    <span className="pval">6</span>
                    <span className="plabel">{t.metricOverdue || "OVERDUE"}</span>
                  </div>
                  <div className="pcell">
                    <span className="pval">412</span>
                    <span className="plabel">{t.metricOnShift || "ON SHIFT"}</span>
                  </div>
                  <div className="pcell">
                    <span className="pval">2.4</span>
                    <span className="plabel">{t.metricDust || "DUST MG/M³"}</span>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
                    <span className="sec-label" style={{ textTransform: "none", letterSpacing: "0.02em", fontSize: "var(--gesso-text-sm)" }}>
                      {t.lblWidgetsPlaced || "Widgets placed"}
                    </span>
                    <span className="pval" style={{ fontSize: "var(--gesso-text-lg)" }}>
                      {selectedWidgetCount} / 6
                    </span>
                  </div>
                  <div className="track" aria-hidden="true">
                    <i style={{ width: `${Math.round((selectedWidgetCount / 6) * 100)}%` }}></i>
                  </div>
                  <p className="field-hint" style={{ marginTop: "8px" }}>
                    {t.widgetsPlacedHint || "Two more widgets fit in the default grid before it scrolls."}
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="rule" style={{ marginTop: "32px" }}></div>
          <footer>
            <span>{t.footerMinistry}</span>
            <span>{t.footerDashboardAutosaved || "Draft autosaved to local storage"}</span>
          </footer>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 3: STATUTORY INSPECTIONS
          ══════════════════════════════════════════════════════════════════════ */}
      {activeFeature === "inspections" && (
        <main className="wrap" data-brief-id="section-new-inspection" data-brief-role="section">
          <section className="pagehead" data-brief-id="page-header" data-brief-role="header">
            <div>
              <button className="backlink" type="button" onClick={() => setActiveFeature("insights")}>
                <ArrowLeftIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.crumbInspections}
              </button>
              <h1>{t.pageNewInspection}</h1>
              <div className="headmeta">
                <span className="tag">
                  <FilePlusIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDraftIns}
                </span>
                <span className="tag quiet">
                  <MapPinIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagJharia}
                </span>
                <span className="tag quiet">
                  <ShieldIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDgmsReg}
                </span>
              </div>
            </div>
            <div className="actionrow" data-brief-id="header-actions" data-brief-role="cta">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => showToast(lang === "en" ? "Draft saved locally." : "मसौदा स्थानीय रूप से सहेजा गया।")}
              >
                <SaveIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.saveDraft}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setActiveFeature("insights")}
              >
                <XIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.discard}
              </button>
            </div>
          </section>

          <div className="rule"></div>

          <div className="main">
            {/* Left Column: Inspection Setup & Site Map */}
            <div className="col">
              <section className="card tinted" data-brief-id="inspection-setup-form" data-brief-role="form">
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
                    <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)", marginTop: 4, maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="twoup">
                  <div className="field">
                    <label htmlFor="ins-mine">{t.lblMineBlock}</label>
                    <button className="well" type="button" id="ins-mine">
                      <span>{t.valMineBlock}</span>
                      <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                    </button>
                  </div>
                  <div className="field">
                    <label htmlFor="ins-section">{t.lblSectionPanel}</label>
                    <button className="well" type="button" id="ins-section">
                      <span>{t.valSectionPanel}</span>
                      <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="ins-officer">{t.lblAssignedInspector}</label>
                  <button className="well" type="button" id="ins-officer">
                    <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="avatar">SK</span>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span className="who-name">S. Kujur</span>
                        <span className="who-role">{t.valSafetyOfficer}</span>
                      </span>
                    </span>
                    <ChevronDownIcon className="ic" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
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

                <div className="field" style={{ marginBottom: "8px" }}>
                  <label>{t.lblPriority}</label>
                  <div className="pillrow" role="group" aria-label="Priority">
                    {[
                      { key: "urgent", label: t.optUrgent },
                      { key: "routine", label: t.optRoutine }
                    ].map((item) => (
                      <button
                        key={item.key}
                        className={`chip ${inspectionPriority === item.key ? "active" : ""}`}
                        type="button"
                        aria-pressed={inspectionPriority === item.key}
                        onClick={() => setInspectionPriority(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  type="button"
                  style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}
                  onClick={() => showToast(lang === "en" ? "Checklist launched for offline use." : "चेकलिस्ट ऑफ़लाइन उपयोग हेतु तैयार।")}
                >
                  <ArrowRightIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.btnCreateChecklist}
                </button>
                <p className="formnote">
                  {t.inspectionOfflineNote}
                </p>
              </section>

              <section className="card" data-brief-id="site-map" data-brief-role="viz">
                <div className="card-head">
                  <span className="sec-label">{t.cardInspectionSite}</span>
                  <span className="sec-label-hi">{t.valMineScope}</span>
                </div>
                <MiningZoneVectorMap label="Map of Jharia Block-4 showing Panel B-3, the site selected for this inspection" lang={lang} />
                <div className="mapfoot">
                  <span>{t.entryPortal}: <b>P-2</b></span>
                  <span>{t.depth}: <b>218 {lang === "en" ? "m" : "मीटर"}</b></span>
                  <span>{t.lastInspected}: <b>{t.date14Feb}</b></span>
                </div>
              </section>
            </div>

            {/* Right Column: Checklist Coverage & Prior Inspections */}
            <div className="col">
              <section className="card" data-brief-id="checklist-coverage" data-brief-role="chart">
                <div className="card-head">
                  <span className="sec-label">{t.cardChecklistCoverage}</span>
                  <span className="sec-label-hi">{t.total26Checkpoints}</span>
                </div>
                <div className="factorlist" data-viz="checkpoint-bars">
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
                <button className="viewall" type="button" onClick={() => showToast(lang === "en" ? "Opening 26 checkpoints" : "26 चेकपॉइंट खुल रहे हैं")}>
                  {t.btnPreviewChecklist}
                  <ArrowRightIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                </button>
              </section>

              <section className="card" data-brief-id="prior-inspections" data-brief-role="list">
                <div className="card-head">
                  <span className="sec-label">{t.cardPriorInspections}</span>
                  <span className="sec-label-hi">{t.sectionBTotal11}</span>
                </div>
                <div className="list">
                  <div className="lrow">
                    <span className="lglyph"><ClipboardCheckIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.prior1Title}</span>
                      <span className="lmeta">{t.prior1Meta}</span>
                    </span>
                    <span className="lval">{t.date14Feb}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><WindIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.prior2Title}</span>
                      <span className="lmeta">{t.prior2Meta}</span>
                    </span>
                    <span className="lval">{lang === "en" ? "09 Feb" : "09 फरवरी"}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><ZapIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.prior3Title}</span>
                      <span className="lmeta">{t.prior3Meta}</span>
                    </span>
                    <span className="lval">{lang === "en" ? "02 Feb" : "02 फरवरी"}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><DropletIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.prior4Title}</span>
                      <span className="lmeta">{t.prior4Meta}</span>
                    </span>
                    <span className="lval">{lang === "en" ? "27 Jan" : "27 जनवरी"}</span>
                  </div>
                </div>
                <button className="viewall" type="button" onClick={() => showToast(lang === "en" ? "Loading 11 inspections" : "11 निरीक्षण लोड हो रहे हैं")}>
                  {t.btnViewAll11Inspections}
                  <ArrowRightIcon className="ic" style={{ maxWidth: 32, maxHeight: 32 }} />
                </button>
              </section>
            </div>
          </div>

          <div className="rule" style={{ marginTop: "32px" }}></div>
          <footer>
            <span>{t.footerMinistry}</span>
            <span>{t.footerInsAutosaved}</span>
          </footer>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 4: STATUTORY RETURNS & REPORTS
          ══════════════════════════════════════════════════════════════════════ */}
      {activeFeature === "reports" && (
        <main className="wrap" data-brief-id="section-create-report" data-brief-role="section">
          <section className="pagehead" data-brief-id="page-header" data-brief-role="header">
            <div>
              <button className="backlink" type="button" onClick={() => setActiveFeature("insights")}>
                <ArrowLeftIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.crumbBackReports}
              </button>
              <h1>{t.pageCreateReport}</h1>
              <div className="headmeta">
                <span className="tag">
                  <FileTextIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagDraftReport}
                </span>
                <span className="tag quiet">
                  <MapPinIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagJharia}
                </span>
                <span className="tag quiet">
                  <ClockIcon className="ic ic-xs" style={{ maxWidth: 32, maxHeight: 32 }} />
                  {t.tagAutosavedTime}
                </span>
              </div>
            </div>
            <div className="actionrow" data-brief-id="head-actions" data-brief-role="cta">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => showToast(lang === "en" ? "Opening print preview..." : "पूर्वावलोकन खुल रहा है...")}
              >
                <EyeIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.preview}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => showToast(lang === "en" ? "Report draft saved." : "रिपोर्ट मसौदा सहेजा गया।")}
              >
                <SaveIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                {t.saveDraft}
              </button>
            </div>
          </section>

          <div className="rule"></div>

          <div className="main">
            {/* Left Column: Report Parameters & Included Sections */}
            <div className="col">
              <section className="card tinted" data-brief-id="report-builder" data-brief-role="form">
                <div className="card-head">
                  <span className="sec-label">{t.cardReportParameters}</span>
                  <span className="sec-label-hi">{t.step1of2}</span>
                </div>

                <div className="field">
                  <span className="flabel" id="lbl-type">{t.lblReportType}</span>
                  <button className="well" type="button" aria-labelledby="lbl-type">
                    <span className="well-stack">
                      <span className="well-title">{t.valReportType}</span>
                      <span className="well-sub">{t.valReportTypeSub}</span>
                    </span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="field">
                  <span className="flabel" id="lbl-scope">{t.lblMineReportScope}</span>
                  <button className="well" type="button" aria-labelledby="lbl-scope">
                    <span className="well-stack">
                      <span className="well-title">{t.valMineScope}</span>
                      <span className="well-sub">{t.valMineReportScopeSub}</span>
                    </span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="field">
                  <span className="flabel" id="lbl-period">{t.lblReportingPeriod}</span>
                  <div className="pillrow" role="group" aria-labelledby="lbl-period">
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
                  <span className="flabel" id="lbl-format">{t.lblOutputFormat}</span>
                  <div className="pillrow" role="group" aria-labelledby="lbl-format">
                    {[
                      { key: "pdf", label: t.optPdf },
                      { key: "xlsx", label: t.optXlsx },
                      { key: "xml", label: t.optDgmsXml }
                    ].map((item) => (
                      <button
                        key={item.key}
                        className={`chip ${outputFormat === item.key ? "active" : ""}`}
                        type="button"
                        aria-pressed={outputFormat === item.key}
                        onClick={() => setOutputFormat(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <span className="flabel" id="lbl-sign">{t.lblSigningAuthority}</span>
                  <button className="well" type="button" aria-labelledby="lbl-sign">
                    <span className="well-stack">
                      <span className="well-title">{t.valSignerName}</span>
                      <span className="well-sub">{t.valSignerRole}</span>
                    </span>
                    <ChevronDownIcon className="ic ic-sm" style={{ color: "var(--gesso-fg-muted)", maxWidth: 32, maxHeight: 32 }} />
                  </button>
                </div>

                <div className="formfoot">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => showToast(lang === "en" ? `Report generated (${selectedSectionCount} sections).` : `रिपोर्ट तैयार हुई (${selectedSectionCount} अनुभाग)।`)}
                  >
                    <FileCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                    {t.btnGenerateReport}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => {
                      setStatutorySections({
                        inspections: true,
                        violations: true,
                        production: true,
                        environment: true,
                        labour: true,
                        statutory: false
                      });
                      showToast(lang === "en" ? "Sections reset." : "अनुभाग रीसेट किए गए।");
                    }}
                  >
                    {t.reset}
                  </button>
                </div>
                <p className="hint">
                  {t.reportGenHint}
                </p>
              </section>

              {/* Statutory Sections Toggles */}
              <section className="card" data-brief-id="report-sections" data-brief-role="list">
                <div className="card-head">
                  <span className="sec-label">{t.cardSectionsIncluded}</span>
                  <span className="sec-label-hi">{selectedSectionCount} / 6 {t.widgetsSelectedOf}</span>
                </div>
                <div className="toggles">
                  <div className="trow2">
                    <span className="tglyph"><ClipboardCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secInspections}</span>
                      <span className="tmeta">{t.secInspectionsMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.inspections ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.inspections}
                      aria-label="Toggle Inspections & findings section"
                      onClick={() => toggleStatutorySection("inspections")}
                    ></button>
                  </div>

                  <div className="trow2">
                    <span className="tglyph"><AlertTriangleIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secViolations}</span>
                      <span className="tmeta">{t.secViolationsMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.violations ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.violations}
                      aria-label="Toggle Violations & CAPA status section"
                      onClick={() => toggleStatutorySection("violations")}
                    ></button>
                  </div>

                  <div className="trow2">
                    <span className="tglyph"><BarChartIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secProduction}</span>
                      <span className="tmeta">{t.secProductionMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.production ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.production}
                      aria-label="Toggle Production & despatch section"
                      onClick={() => toggleStatutorySection("production")}
                    ></button>
                  </div>

                  <div className="trow2">
                    <span className="tglyph"><WindIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secEnvironment}</span>
                      <span className="tmeta">{t.secEnvironmentMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.environment ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.environment}
                      aria-label="Toggle Environment monitoring section"
                      onClick={() => toggleStatutorySection("environment")}
                    ></button>
                  </div>

                  <div className="trow2">
                    <span className="tglyph"><UsersIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secLabour}</span>
                      <span className="tmeta">{t.secLabourMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.labour ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.labour}
                      aria-label="Toggle Labour & attendance section"
                      onClick={() => toggleStatutorySection("labour")}
                    ></button>
                  </div>

                  <div className="trow2">
                    <span className="tglyph"><FileTextIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ttxt">
                      <span className="ttitle">{t.secStatutory}</span>
                      <span className="tmeta">{t.secStatutoryMeta}</span>
                    </span>
                    <button
                      className={`switch ${statutorySections.statutory ? "active" : ""}`}
                      type="button"
                      aria-pressed={statutorySections.statutory}
                      aria-label="Toggle Statutory declarations section"
                      onClick={() => toggleStatutorySection("statutory")}
                    ></button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Live Report Preview & Compliance Archive */}
            <div className="col">
              <section className="card" data-brief-id="report-preview" data-brief-role="section">
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
                      <span className="pv-v" style={{ fontFamily: "var(--gesso-font-mono)", fontSize: "11px" }}>SHA256: 8f9b2a7d4e1c</span>
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

              <section className="card" data-brief-id="recent-reports" data-brief-role="list">
                <div className="card-head">
                  <span className="sec-label">{t.cardRecentReturns}</span>
                  <span className="sec-label-hi">{t.block4Archive}</span>
                </div>
                <div className="list">
                  <div className="lrow">
                    <span className="lglyph"><FileCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.ret1Title}</span>
                      <span className="lmeta">{t.ret1Meta}</span>
                    </span>
                    <span className="lval">{t.date31Jan}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><FileCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.ret2Title}</span>
                      <span className="lmeta">{t.ret2Meta}</span>
                    </span>
                    <span className="lval">{t.date31Dec}</span>
                  </div>
                  <div className="lrow">
                    <span className="lglyph"><FileCheckIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} /></span>
                    <span className="ltxt">
                      <span className="ltitle">{t.ret3Title}</span>
                      <span className="lmeta">{t.ret3Meta}</span>
                    </span>
                    <span className="lval">{t.date15Jan}</span>
                  </div>
                </div>
                <button className="viewall" type="button" onClick={() => showToast(lang === "en" ? "Opening National Compliance Archive" : "राष्ट्रीय अनुपालन पुरालेख खुल रहा है")}>
                  {t.btnViewArchive}
                  <ArrowRightIcon className="ic ic-sm" style={{ maxWidth: 32, maxHeight: 32 }} />
                </button>
              </section>
            </div>
          </div>

          <div className="rule" style={{ marginTop: "32px" }}></div>
          <footer>
            <span>{t.footerMinistry}</span>
            <span>{t.footerReportAutosaved}</span>
          </footer>
        </main>
      )}
        </div>
      </div>
    </div>
  );
}