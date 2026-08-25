import {
  PrismaClient,
  UserRole,
  ComplianceCategory,
  ApplicableTo,
  ComplianceStatus,
  InspectionStatus,
  ObservationSeverity,
  FindingType,
  ViolationStatus,
  CapaStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  canonicalizePayload,
  computePayloadHash,
  computeHmacChainHash,
  GENESIS_PREV_HASH,
  CHAIN_VERSION,
} from '../src/audit/canonicalizer';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_DEFAULT_PASSWORD || 'Test@1234';
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  console.log('🌱 Seeding database...');

  // ─── Companies (idempotent by code) ───────────────────────────────────────
  const bccl = await prisma.company.upsert({
    where: { code: 'BCCL' },
    update: {},
    create: {
      name: 'Bharat Coking Coal Limited',
      code: 'BCCL',
      type: 'SUBSIDIARY',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Company: ${bccl.name} (${bccl.code})`);

  const ecl = await prisma.company.upsert({
    where: { code: 'ECL' },
    update: {},
    create: {
      name: 'Eastern Coalfields Limited',
      code: 'ECL',
      type: 'SUBSIDIARY',
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Company: ${ecl.name} (${ecl.code})`);

  // ─── Users (idempotent by email) ──────────────────────────────────────────
  const users = [
    {
      name: 'Admin User',
      email: 'admin@coalmine.gov.in',
      phone: '+91-9876543210',
      role: UserRole.ADMIN,
      companyId: null,
    },
    {
      name: 'DGMS Regulator',
      email: 'regulator@dgms.gov.in',
      phone: '+91-9876543211',
      role: UserRole.REGULATOR,
      companyId: null,
    },
    {
      name: 'CIL Corporate Manager',
      email: 'corporate@coalindia.gov.in',
      phone: '+91-9876543212',
      role: UserRole.CORPORATE,
      companyId: bccl.id,
    },
    {
      name: 'R. Mahapatra',
      email: 'r.mahapatra@coalindia.gov.in',
      phone: '+91-9876543213',
      role: UserRole.MINE_OFFICIAL,
      companyId: bccl.id,
    },
  ];

  const dbUsers: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { companyId: u.companyId },
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role,
        companyId: u.companyId,
        status: 'ACTIVE',
      },
    });
    dbUsers[u.email] = user.id;
    console.log(`  ✓ User: ${u.email} (${u.role})`);
  }

  // ─── Mines (idempotent by code) ───────────────────────────────────────────
  const mineData = [
    {
      name: 'Jharia Block-4',
      code: 'BCCL-JHA-BLK4',
      location: 'Jharia Coalfield, Dhanbad, Jharkhand',
      companyId: bccl.id,
      geoBoundary: {
        type: 'Polygon',
        coordinates: [
          [
            [86.4050, 23.7350],
            [86.4350, 23.7350],
            [86.4350, 23.7650],
            [86.4050, 23.7650],
            [86.4050, 23.7350],
          ],
        ],
      },
    },
    {
      name: 'Korba West Pit-2',
      code: 'BCCL-KRB-WP2',
      location: 'Korba Coalfield, Chhattisgarh',
      companyId: bccl.id,
      geoBoundary: {
        type: 'Polygon',
        coordinates: [
          [
            [82.7300, 22.3400],
            [82.7700, 22.3400],
            [82.7700, 22.3800],
            [82.7300, 22.3800],
            [82.7300, 22.3400],
          ],
        ],
      },
    },
    {
      name: 'Raniganj Seam-VII',
      code: 'ECL-RNG-S7',
      location: 'Raniganj Coalfield, West Bengal',
      companyId: ecl.id,
      geoBoundary: { lat: 23.6135, lng: 87.1246, radius_km: 2.0 },
    },
    {
      name: 'Singrauli Block-B',
      code: 'ECL-SNG-BB',
      location: 'Singrauli Coalfield, Madhya Pradesh',
      companyId: ecl.id,
      geoBoundary: { lat: 24.0996, lng: 82.6751, radius_km: 4.0 },
    },
  ];

  const mines: Record<string, string> = {};
  for (const m of mineData) {
    const mine = await prisma.mine.upsert({
      where: { code: m.code },
      update: { geoBoundary: m.geoBoundary as any },
      create: {
        name: m.name,
        code: m.code,
        location: m.location,
        companyId: m.companyId,
        geoBoundary: m.geoBoundary as any,
        status: 'ACTIVE',
      },
    });
    mines[m.code] = mine.id;
    console.log(`  ✓ Mine: ${mine.name} (${mine.code})`);
  }

  // ─── User-to-Mine Assignments ─────────────────────────────────────────────
  const jhariaId = mines['BCCL-JHA-BLK4'];
  const korbaId = mines['BCCL-KRB-WP2'];
  const mahapatraId = dbUsers['r.mahapatra@coalindia.gov.in'];
  const adminId = dbUsers['admin@coalmine.gov.in'];

  for (const mId of [jhariaId, korbaId]) {
    await prisma.userMineAssignment.upsert({
      where: {
        userId_mineId: { userId: mahapatraId, mineId: mId },
      },
      update: { active: true },
      create: {
        userId: mahapatraId,
        mineId: mId,
        assignedById: adminId,
        active: true,
      },
    });
  }
  console.log(`  ✓ User Mine Assignments: R. Mahapatra assigned to Jharia & Korba mines`);

  // ─── Compliance Requirements (idempotent by title) ────────────────────────
  const requirements = [
    {
      title: 'CMR 2017 — Reg. 108: Strata Control & Support Plan (SCAMP)',
      category: ComplianceCategory.SAFETY,
      frequency: 'Daily / Shift-wise',
      description: 'Mandatory daily roof support inspection under Coal Mines Regulations 2017, Regulation 108.',
      applicableTo: ApplicableTo.MINE,
    },
    {
      title: 'CMR 2017 — Reg. 140: Underground Ventilation & Gas Standards',
      category: ComplianceCategory.SAFETY,
      frequency: 'Continuous Telemetry',
      description: 'Continuous monitoring of CH4, CO, O2 levels and airflow velocity in underground workings.',
      applicableTo: ApplicableTo.MINE,
    },
    {
      title: 'MoEFCC Air Quality Standards: PM10 / PM2.5 Ambient Dust Limit',
      category: ComplianceCategory.ENVIRONMENT,
      frequency: 'Continuous 24h',
      description: 'Ambient dust monitoring per Ministry of Environment, Forest and Climate Change norms.',
      applicableTo: ApplicableTo.MINE,
    },
    {
      title: 'Mines Act 1952 — Form IV-B: Quarterly OHS Declaration',
      category: ComplianceCategory.LABOUR,
      frequency: 'Quarterly Return',
      description: 'Quarterly Occupational Health & Safety declaration submitted to DGMS.',
      applicableTo: ApplicableTo.COMPANY,
    },
    {
      title: 'Mines Act 1952 — Form III-A: Monthly Statutory Return',
      category: ComplianceCategory.PRODUCTION,
      frequency: 'Monthly (Due 20th)',
      description: 'Monthly statutory return covering production, despatch, and workforce data.',
      applicableTo: ApplicableTo.MINE,
    },
  ];

  const reqMap: Record<string, string> = {};
  for (const r of requirements) {
    const existing = await prisma.complianceRequirement.findFirst({
      where: { title: r.title },
    });

    if (existing) {
      reqMap[r.title] = existing.id;
      console.log(`  ✓ Requirement (exists): ${r.title.substring(0, 50)}...`);
    } else {
      const created = await prisma.complianceRequirement.create({ data: r });
      reqMap[r.title] = created.id;
      console.log(`  ✓ Requirement (new): ${r.title.substring(0, 50)}...`);
    }
  }

  // ─── Compliance Records ───────────────────────────────────────────────────
  const statuses = [
    ComplianceStatus.COMPLIANT,
    ComplianceStatus.NON_COMPLIANT,
    ComplianceStatus.PENDING,
    ComplianceStatus.COMPLIANT,
    ComplianceStatus.PENDING,
  ];

  const remarks = [
    'All support bolts verified — within threshold',
    'High risk flag — strata convergence drift detected',
    'Awaiting quarterly submission',
    'PM10 readings compliant at 2.4 mg/m³',
    'Draft ready for DSC signing',
  ];

  const mineIds = Object.values(mines);
  const reqIds = Object.values(reqMap);
  const compRecords: Record<string, string> = {};

  for (let mi = 0; mi < mineIds.length; mi++) {
    for (let ri = 0; ri < reqIds.length; ri++) {
      const statusIndex = (mi + ri) % statuses.length;
      const key = `${mineIds[mi]}_${reqIds[ri]}`;
      const existing = await prisma.complianceRecord.findUnique({
        where: {
          requirementId_mineId: {
            requirementId: reqIds[ri],
            mineId: mineIds[mi],
          },
        },
      });

      if (!existing) {
        const rec = await prisma.complianceRecord.create({
          data: {
            requirementId: reqIds[ri],
            mineId: mineIds[mi],
            status: statuses[statusIndex],
            remarks: remarks[statusIndex],
            lastCheckedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            nextDueAt: new Date(Date.now() + (7 + ri * 7) * 24 * 60 * 60 * 1000),
          },
        });
        compRecords[key] = rec.id;
      } else {
        compRecords[key] = existing.id;
      }
    }
  }
  console.log(`  ✓ Compliance records: ${mineIds.length} mines × ${reqIds.length} requirements`);

  // ─── Inspection Template ──────────────────────────────────────────────────
  const scampTitle = 'CMR 2017 — Reg. 108: Strata Control & Support Plan (SCAMP)';
  const ventTitle = 'CMR 2017 — Reg. 140: Underground Ventilation & Gas Standards';

  let template = await prisma.inspectionTemplate.findFirst({
    where: { name: 'Statutory Underground Shift Safety Checklist' },
  });

  if (!template) {
    template = await prisma.inspectionTemplate.create({
      data: {
        name: 'Statutory Underground Shift Safety Checklist',
        category: ComplianceCategory.SAFETY,
        description: 'Standard DGMS shift inspection checklist covering roof strata control and telemetry verification.',
        companyId: bccl.id,
        createdById: adminId,
        checklist: [
          {
            key: 'chk_scamp_bolts',
            label: 'Verify resin-grouted roof bolt tension and tell-tale indicators',
            regulation: 'CMR Reg. 108',
            category: 'SAFETY',
            mandatory: true,
          },
          {
            key: 'chk_vent_ch4',
            label: 'Verify main return airway methane concentration < 0.75%',
            regulation: 'CMR Reg. 140',
            category: 'SAFETY',
            mandatory: true,
          },
          {
            key: 'chk_dust_suppression',
            label: 'Inspect active water spray nozzles on transfer conveyor point',
            regulation: 'CMR Reg. 123',
            category: 'ENVIRONMENT',
            mandatory: false,
          },
        ],
      },
    });
    console.log(`  ✓ Inspection Template: ${template.name}`);
  }

  // ─── Operational Inspection Scenario (Completed + Violation + Closed CAPA) ─
  let completedInsp = await prisma.inspection.findFirst({
    where: {
      mineId: jhariaId,
      purpose: 'Statutory Morning Shift Underground Inspection',
    },
  });

  if (!completedInsp) {
    completedInsp = await prisma.inspection.create({
      data: {
        mineId: jhariaId,
        templateId: template.id,
        scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000),
        status: InspectionStatus.COMPLETED,
        conductedById: mahapatraId,
        createdById: adminId,
        purpose: 'Statutory Morning Shift Underground Inspection',
        summary: 'Inspection completed across Seam 14 Panel-C. Strata roof convergence noted and corrected.',
      },
    });

    // Observation 1: Unsafe Condition (Violations raised & CAPA closed)
    const obs1 = await prisma.observation.create({
      data: {
        inspectionId: completedInsp.id,
        sequenceNumber: 1,
        title: 'Excessive strata convergence on Return Gate Road Panel-C',
        description: 'Tell-tale indicator measured 18mm convergence exceeding the 10mm statutory threshold.',
        category: ComplianceCategory.SAFETY,
        severity: ObservationSeverity.CRITICAL,
        findingType: FindingType.NON_COMPLIANCE,
        complianceRequirementId: reqMap[scampTitle],
        complianceRecordId: compRecords[`${jhariaId}_${reqMap[scampTitle]}`],
        isViolationCandidate: true,
        recordedById: mahapatraId,
      },
    });

    // Observation 2: Note (Compliant)
    await prisma.observation.create({
      data: {
        inspectionId: completedInsp.id,
        sequenceNumber: 2,
        title: 'Auxiliary fan ventilation volume verified nominal',
        description: 'Airflow velocity measured at 1.4 m/s at last ventilation connection.',
        category: ComplianceCategory.SAFETY,
        severity: ObservationSeverity.LOW,
        findingType: FindingType.NOTE,
        complianceRequirementId: reqMap[ventTitle],
        complianceRecordId: compRecords[`${jhariaId}_${reqMap[ventTitle]}`],
        isViolationCandidate: false,
        recordedById: mahapatraId,
      },
    });

    // Violation for Obs 1
    const violation1 = await prisma.violation.create({
      data: {
        observationId: obs1.id,
        mineId: jhariaId,
        complianceRequirementId: reqMap[scampTitle],
        complianceRecordId: compRecords[`${jhariaId}_${reqMap[scampTitle]}`],
        severity: ObservationSeverity.CRITICAL,
        status: ViolationStatus.RESOLVED,
        title: 'CMR Reg. 108 SCAMP Violation — Strata Convergence Drift',
        description: 'Tell-tale indicator measured 18mm convergence on Return Gate Road Panel-C.',
        raisedById: mahapatraId,
        raisedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 3600 * 1000),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resolutionNote: 'Additional hydraulic prop supports installed and certified by Strata Officer.',
      },
    });

    // Corrective Action for Violation 1
    await prisma.correctiveAction.create({
      data: {
        violationId: violation1.id,
        title: 'Install secondary hydraulic support props at 1.2m intervals',
        description: 'Deploy 8 hydraulic props across Panel-C junction and re-measure convergence indicators.',
        assignedToId: mahapatraId,
        assignedById: adminId,
        dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: CapaStatus.CLOSED,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
        closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        closureNote: '8 hydraulic props deployed; convergence stabilized at 6mm within allowable threshold.',
        verifiedById: adminId,
        verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`  ✓ Operational Scenario: Completed Inspection with Observations, Resolved Violation, and Closed CAPA`);
  }

  // ─── Scheduled Inspection for Tomorrow ────────────────────────────────────
  const existingSched = await prisma.inspection.findFirst({
    where: {
      mineId: korbaId,
      purpose: 'Quarterly DGMS Electrical & Winding Gear Audit',
    },
  });

  if (!existingSched) {
    await prisma.inspection.create({
      data: {
        mineId: korbaId,
        templateId: template.id,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: InspectionStatus.SCHEDULED,
        createdById: adminId,
        purpose: 'Quarterly DGMS Electrical & Winding Gear Audit',
      },
    });
    console.log(`  ✓ Scheduled Inspection: Korba West Pit-2 Audit`);
  }

  // ─── Phase 9: Seed Risk Scores & Anomaly Flags for Demo ───────────────────
  const bcclCompany = await prisma.company.findUnique({ where: { code: 'BCCL' } });
  if (bcclCompany) {
    // 1. High Risk Pit (Jharia Block-4) -> CRITICAL (Score: 82)
    const jhariaScore = await prisma.riskScore.create({
      data: {
        mineId: jhariaId,
        companyId: bcclCompany.id,
        score: 82,
        band: 'CRITICAL',
        calculationVersion: '1.0.0',
        calculatedAt: new Date(),
        windowStart: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        windowEnd: new Date(),
        factors: {
          violations: { weight: 0.35, rawPoints: 50, normalizedScore: 100, weightedScore: 35 },
          capas: { weight: 0.25, rawPoints: 20, normalizedScore: 50, weightedScore: 12.5 },
          compliance: { weight: 0.25, rawPoints: 50, normalizedScore: 100, weightedScore: 25 },
          inspectionGap: { weight: 0.15, rawPoints: 66.7, normalizedScore: 66.7, weightedScore: 10 },
        },
        sourceCounts: {
          totalViolations: 2,
          criticalViolations: 2,
          overdueCapas: 1,
          nonCompliantRecords: 2,
          overdueCompliance: 1,
          completedInspections: 1,
        },
        plainLanguageExplanation:
          'Jharia Block-4 has a CRITICAL risk score of 82/100, primarily driven by elevated statutory violations (2 critical in last 30d) and statutory compliance deficits (2 non-compliant, 1 overdue returns). Immediate management remediation and statutory review are advised.',
      },
    });

    const dateKey = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
    await prisma.anomalyFlag.upsert({
      where: { dedupKey: `${jhariaId}:VIOLATION_SPIKE:${dateKey}` },
      update: {},
      create: {
        mineId: jhariaId,
        type: 'VIOLATION_SPIKE',
        status: 'OPEN',
        detectedAt: new Date(),
        baseline: { windowDays: 30, violationsCount: 0 },
        observed: { windowDays: 30, violationsCount: 2, criticalCount: 2 },
        threshold: 'violations >= 2, surge >= +2, relative >= 2.0x',
        calculationVersion: '1.0.0',
        relatedRiskScoreId: jhariaScore.id,
        dedupKey: `${jhariaId}:VIOLATION_SPIKE:${dateKey}`,
      },
    });

    // 2. Normal Pit (Korba West Pit-2) -> LOW (Score: 12)
    await prisma.riskScore.create({
      data: {
        mineId: korbaId,
        companyId: bcclCompany.id,
        score: 12,
        band: 'LOW',
        calculationVersion: '1.0.0',
        calculatedAt: new Date(),
        windowStart: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        windowEnd: new Date(),
        factors: {
          violations: { weight: 0.35, rawPoints: 0, normalizedScore: 0, weightedScore: 0 },
          capas: { weight: 0.25, rawPoints: 0, normalizedScore: 0, weightedScore: 0 },
          compliance: { weight: 0.25, rawPoints: 0, normalizedScore: 0, weightedScore: 0 },
          inspectionGap: { weight: 0.15, rawPoints: 80, normalizedScore: 80, weightedScore: 12 },
        },
        sourceCounts: {
          totalViolations: 0,
          criticalViolations: 0,
          overdueCapas: 0,
          nonCompliantRecords: 0,
          overdueCompliance: 0,
          completedInspections: 1,
        },
        plainLanguageExplanation:
          'Korba West Pit-2 maintains a LOW risk profile (Score: 12/100). Safety observations, statutory compliance returns, and corrective action lifecycles are operating within standard tolerance thresholds.',
      },
    });

    console.log(`  ✓ Phase 9 Demo: Seeded CRITICAL Risk Score & Anomaly Spike (Jharia) and LOW Risk Score (Korba)`);

    // ─── Phase 4: Seed Contractors, Contracts & Workers ───────────────────────
    // 1. Active Contractor at Jharia
    const contractor1 = await prisma.contractor.upsert({
      where: {
        companyId_registrationNumber: {
          companyId: bcclCompany.id,
          registrationNumber: 'CIN-U10100MH2018PTC123456',
        },
      },
      update: {},
      create: {
        companyId: bcclCompany.id,
        legalName: 'Deccan Mining & Infrastructure Solutions Pvt Ltd',
        tradeName: 'Deccan Mining',
        registrationNumber: 'CIN-U10100MH2018PTC123456',
        contactName: 'Suresh Patil',
        email: 'suresh@deccanmining.com',
        phone: '+91 9876543210',
        address: { street: '12 Industrial Area', city: 'Nagpur', state: 'Maharashtra', postalCode: '440001' },
        status: 'ACTIVE',
      },
    });

    const activeContract = await prisma.contractorContract.upsert({
      where: {
        companyId_contractNumber: {
          companyId: bcclCompany.id,
          contractNumber: 'CNT-2026-HEMM-JHA01',
        },
      },
      update: {},
      create: {
        contractorId: contractor1.id,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        contractNumber: 'CNT-2026-HEMM-JHA01',
        title: 'Overburden Removal & Heavy Machinery Operations',
        startDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 300 * 24 * 3600 * 1000),
        status: 'ACTIVE',
        scopeOfWork: { excavators: 6, dumpers: 20, monthlyTargetCuM: 250000 },
        createdById: adminId,
      },
    });

    const worker1 = await prisma.contractorWorker.upsert({
      where: {
        contractorId_employeeCode: {
          contractorId: contractor1.id,
          employeeCode: 'DEC-WRK-001',
        },
      },
      update: {},
      create: {
        contractorId: contractor1.id,
        employeeCode: 'DEC-WRK-001',
        fullName: 'Ramesh Kumar Verma',
        phone: '+91 9123456789',
        governmentIdHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        governmentIdMasked: 'XXXX-XXXX-4921',
        role: 'HEMM Heavy Excavator Operator',
        status: 'ACTIVE',
      },
    });

    const worker2 = await prisma.contractorWorker.upsert({
      where: {
        contractorId_employeeCode: {
          contractorId: contractor1.id,
          employeeCode: 'DEC-WRK-002',
        },
      },
      update: {},
      create: {
        contractorId: contractor1.id,
        employeeCode: 'DEC-WRK-002',
        fullName: 'Sunil Soren',
        phone: '+91 9832109876',
        governmentIdHash: 'f4b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b866',
        governmentIdMasked: 'XXXX-XXXX-8832',
        role: 'Heavy Dumper Operator',
        status: 'ACTIVE',
      },
    });

    for (const w of [worker1, worker2]) {
      await prisma.contractorWorkerAssignment.upsert({
        where: {
          workerId_contractId_mineId: {
            workerId: w.id,
            contractId: activeContract.id,
            mineId: jhariaId,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          workerId: w.id,
          contractId: activeContract.id,
          mineId: jhariaId,
          status: 'ACTIVE',
        },
      });
    }

    // 2. Expired Contractor at Korba
    const contractor2 = await prisma.contractor.upsert({
      where: {
        companyId_registrationNumber: {
          companyId: bcclCompany.id,
          registrationNumber: 'CIN-U10100WB2015PLC654321',
        },
      },
      update: {},
      create: {
        companyId: bcclCompany.id,
        legalName: 'Eastern Earthmovers Ltd',
        tradeName: 'Eastern Earthmovers',
        registrationNumber: 'CIN-U10100WB2015PLC654321',
        contactName: 'Anil Mukhopadhyay',
        email: 'anil@easternearth.in',
        phone: '+91 9345678901',
        status: 'ACTIVE',
      },
    });

    await prisma.contractorContract.upsert({
      where: {
        companyId_contractNumber: {
          companyId: bcclCompany.id,
          contractNumber: 'CNT-2024-SURVEY-KRB01',
        },
      },
      update: {},
      create: {
        contractorId: contractor2.id,
        companyId: bcclCompany.id,
        mineId: korbaId,
        contractNumber: 'CNT-2024-SURVEY-KRB01',
        title: 'Geotechnical Topographic Survey Contract',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        status: 'EXPIRED',
        scopeOfWork: { deliverables: 'Complete LiDAR terrain elevation map' },
        createdById: adminId,
      },
    });

    console.log(`  ✓ Phase 4 Demo: Seeded Active Contractor & Workers (Jharia) and Expired Contractor (Korba)`);

    // ─── Phase 5: Seed Unified Workers & Attendance Records ───────────────────
    const adminUserId = dbUsers['admin@coalmine.gov.in'];
    const officialUserId = dbUsers['r.mahapatra@coalindia.gov.in'];

    // Unified Worker Profiles for Contractor Workers
    const uWorker1 = await prisma.worker.upsert({
      where: { contractorWorkerId: worker1.id },
      update: {},
      create: {
        companyId: bcclCompany.id,
        employmentType: 'CONTRACTOR',
        displayName: 'Ramesh Kumar Verma',
        employeeCode: 'DEC-WRK-001',
        phone: '+91 9123456789',
        contractorWorkerId: worker1.id,
        status: 'ACTIVE',
      },
    });

    const uWorker2 = await prisma.worker.upsert({
      where: { contractorWorkerId: worker2.id },
      update: {},
      create: {
        companyId: bcclCompany.id,
        employmentType: 'CONTRACTOR',
        displayName: 'Sunil Soren',
        employeeCode: 'DEC-WRK-002',
        phone: '+91 9832109876',
        contractorWorkerId: worker2.id,
        status: 'ACTIVE',
      },
    });
    const uWorker3 = await prisma.worker.upsert({
      where: { companyId_employeeCode: { companyId: bcclCompany.id, employeeCode: 'BCCL-EMP-001' } },
      update: {},
      create: {
        companyId: bcclCompany.id,
        employmentType: 'EMPLOYEE',
        displayName: 'Aakash Sharma',
        employeeCode: 'BCCL-EMP-001',
        phone: '+91 9431109988',
        userId: officialUserId,
        status: 'ACTIVE',
      },
    });

    const todayIST = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().split('T')[0];

    // Seed Attendance 1: Open Shift (Ramesh Verma, Contractor)
    const checkIn1 = new Date();
    checkIn1.setHours(7, 0, 0, 0);
    await prisma.attendanceRecord.upsert({
      where: { id: 'att-demo-open-01' },
      update: {},
      create: {
        id: 'att-demo-open-01',
        workerId: uWorker1.id,
        mineId: jhariaId,
        companyId: bcclCompany.id,
        businessDate: todayIST,
        checkInAt: checkIn1,
        checkInLatitude: 23.7957,
        checkInLongitude: 86.4304,
        checkInMethod: 'MOBILE',
        recordedById: officialUserId,
        note: 'HEMM Shift 1 Entry',
        isOpen: true,
      },
    });

    // Seed Attendance 2: Completed Shift (Sunil Soren, Contractor)
    const checkIn2 = new Date();
    checkIn2.setHours(6, 0, 0, 0);
    const checkOut2 = new Date();
    checkOut2.setHours(14, 0, 0, 0);
    await prisma.attendanceRecord.upsert({
      where: { id: 'att-demo-closed-02' },
      update: {},
      create: {
        id: 'att-demo-closed-02',
        workerId: uWorker2.id,
        mineId: jhariaId,
        companyId: bcclCompany.id,
        businessDate: todayIST,
        checkInAt: checkIn2,
        checkOutAt: checkOut2,
        checkInLatitude: 23.7958,
        checkInLongitude: 86.4305,
        checkOutLatitude: 23.7960,
        checkOutLongitude: 86.4308,
        checkInMethod: 'KIOSK',
        checkOutMethod: 'KIOSK',
        recordedById: officialUserId,
        note: 'Dumper Operator Morning Shift Complete',
        isOpen: false,
      },
    });

    // Seed Attendance 3: Open Shift (Aakash Sharma, Employee)
    const checkIn3 = new Date();
    checkIn3.setHours(8, 30, 0, 0);
    await prisma.attendanceRecord.upsert({
      where: { id: 'att-demo-open-03' },
      update: {},
      create: {
        id: 'att-demo-open-03',
        workerId: uWorker3.id,
        mineId: jhariaId,
        companyId: bcclCompany.id,
        businessDate: todayIST,
        checkInAt: checkIn3,
        checkInLatitude: 23.7950,
        checkInLongitude: 86.4300,
        checkInMethod: 'MANUAL',
        recordedById: adminId,
        note: 'Mine Supervision & Safety Inspection Duty',
        isOpen: true,
      },
    });

    console.log(`  ✓ Phase 5 Demo: Seeded Unified Workers & 3 Attendance Shifts (2 Open, 1 Closed) at Jharia`);

    // ─── Phase 6: Seed Grievances & Comments ──────────────────────────────────
    // 1. Urgent Safety Grievance (IN_PROGRESS, Jharia Block-4)
    const grv1 = await prisma.grievance.upsert({
      where: { id: 'grv-demo-urgent-01' },
      update: {},
      create: {
        id: 'grv-demo-urgent-01',
        reporterId: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        subject: 'High-voltage Cable Insulation Degradation at Substation-2',
        description: 'Visual inspection indicates severe thermal cracking on the 11kV feeder line insulation near the secondary transformer bank.',
        category: 'SAFETY',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assignedToId: officialUserId,
        slaDueAt: new Date(Date.now() + 24 * 3600 * 1000),
        acknowledgedAt: new Date(),
      },
    });

    await prisma.grievanceComment.upsert({
      where: { id: 'grv-comm-01' },
      update: {},
      create: {
        id: 'grv-comm-01',
        grievanceId: grv1.id,
        authorId: officialUserId,
        body: 'Electrical engineering team dispatched with thermal imaging scanner to assess hotspots.',
        visibility: 'REPORTER_AND_HANDLERS',
      },
    });

    await prisma.grievanceComment.upsert({
      where: { id: 'grv-comm-02' },
      update: {},
      create: {
        id: 'grv-comm-02',
        grievanceId: grv1.id,
        authorId: adminUserId,
        body: 'Internal Note: DGMS regional inspector has been informally briefed. Replacement 11kV cable requisition order #EQ-9921 placed.',
        visibility: 'HANDLERS_ONLY',
      },
    });

    // 2. Resolved Equipment Grievance (RESOLVED, Jharia Block-4)
    await prisma.grievance.upsert({
      where: { id: 'grv-demo-resolved-02' },
      update: {},
      create: {
        id: 'grv-demo-resolved-02',
        reporterId: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        subject: 'Dust Suppression Water Sprinkler Valve Jam at Coal Chute',
        description: 'Misting nozzles clogged due to silt buildup in intake line, causing excessive particulate dust during hopper unloading.',
        category: 'ENVIRONMENT',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assignedToId: officialUserId,
        slaDueAt: new Date(Date.now() + 168 * 3600 * 1000),
        acknowledgedAt: new Date(Date.now() - 48 * 3600 * 1000),
        resolvedAt: new Date(),
        resolutionNote: 'Cleaned intake strainers, backflushed manifold, and replaced 6 ceramic misting nozzles. Flow rate restored to 45 L/min.',
      },
    });

    // 3. Escalated Company-Level Wage Dispute (ESCALATED, Company-wide)
    await prisma.grievance.upsert({
      where: { id: 'grv-demo-escalated-03' },
      update: {},
      create: {
        id: 'grv-demo-escalated-03',
        reporterId: officialUserId,
        companyId: bcclCompany.id,
        mineId: null, // Company-wide
        subject: 'Disputed Contractor Overtime Tariff Calculation for July 2026',
        description: 'Contractor operators seeking reconciliation of night shift allowances and statutory overtime multipliers under Mines Rules 1955.',
        category: 'WAGE_PAYMENT',
        priority: 'HIGH',
        status: 'ESCALATED',
        assignedToId: dbUsers['corporate@coalindia.gov.in'],
        slaDueAt: new Date(Date.now() + 72 * 3600 * 1000),
        acknowledgedAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
    });

    console.log(`  ✓ Phase 6 Demo: Seeded 3 Grievances (Urgent with Handlers-Only Note, Resolved Equipment, Escalated Wage Dispute)`);

    // ─── Phase 10: Seed Attachments & OCR Extractions ─────────────────────────
    const attFormIVB = await prisma.attachment.upsert({
      where: { id: 'att-demo-form-iv-b' },
      update: {},
      create: {
        id: 'att-demo-form-iv-b',
        fileName: 'dgms-form-iv-b-q2-2026.pdf',
        fileSize: 245000,
        mimeType: 'application/pdf',
        fileHash: 'sha256-demo-form-iv-b-hash-0123456789abcdef',
        storageKey: 'attachments/2026/08/dgms-form-iv-b-q2-2026.pdf',
        uploadedById: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
      },
    });

    const ocrJob1 = await prisma.ocrJob.upsert({
      where: { id: 'ocr-job-demo-01' },
      update: {},
      create: {
        id: 'ocr-job-demo-01',
        attachmentId: attFormIVB.id,
        requestedById: officialUserId,
        status: 'COMPLETED',
        engineName: 'mock-ocr-v1',
        engineVersion: '1.0.0',
        languageHints: ['eng', 'hin'],
        targetType: 'COMPLIANCE_RECORD',
        startedAt: new Date(Date.now() - 3600 * 1000),
        completedAt: new Date(Date.now() - 3550 * 1000),
      },
    });

    await prisma.ocrExtraction.upsert({
      where: { jobId: ocrJob1.id },
      update: {},
      create: {
        id: 'ocr-ext-demo-01',
        jobId: ocrJob1.id,
        rawText: `DIRECTORATE GENERAL OF MINES SAFETY\nFORM IV-B (See Rule 21(1))\nQuarter Ending June 2026\nAverage Daily Employment: 1420\nFatalities: NIL (0)\nSerious Bodily Injuries: 1\nPit Safety Committee Meetings Held: 3\nStatutory Compliance Status: Fully Certified`,
        confidence: 0.96,
        fields: {
          formType: { value: 'Form IV-B', confidence: 0.98, span: 'FORM IV-B (See Rule 21(1))' },
          reportingPeriod: { value: 'Q2-2026', confidence: 0.95, span: 'Quarter Ending June 2026' },
          averageDailyEmployment: { value: 1420, confidence: 0.92, span: 'Average Daily Employment: 1420' },
          fatalAccidents: { value: 0, confidence: 0.99, span: 'Fatalities: NIL (0)' },
          seriousInjuries: { value: 1, confidence: 0.94, span: 'Serious Bodily Injuries: 1' },
          safetyCommitteeMeetings: { value: 3, confidence: 0.96, span: 'Pit Safety Committee Meetings Held: 3' },
          complianceStatus: { value: 'COMPLIANT', confidence: 0.97, span: 'Statutory Compliance Status: Fully Certified' },
        },
        correctedFields: {
          formType: 'Form IV-B',
          reportingPeriod: 'Q2-2026',
          averageDailyEmployment: 1420,
          fatalAccidents: 0,
          seriousInjuries: 1,
          reviewedVerificationDate: '2026-08-25',
        },
        reviewedById: dbUsers['corporate@coalindia.gov.in'],
        reviewedAt: new Date(),
        isLinked: true,
      },
    });

    console.log(`  ✓ Phase 10 Demo: Seeded GeoJSON Polygon Mine Boundaries & Verified OCR Digitization Jobs`);

    // ─── Phase 11: Seed Genesis Hash-Chained Audit Trail ─────────────────────
    await prisma.auditLog.deleteMany({});
    const hmacSecret = process.env.AUDIT_HMAC_SECRET || 'khanan-suraksha-audit-hmac-secret-key-2026';
    const auditEntries = [
      {
        sequence: 1,
        action: 'COMPLIANCE_REQUIREMENTS_INITIALIZED',
        entityType: 'System',
        entityId: 'dgms-statutory-baseline',
        actorId: dbUsers['admin@coalmine.gov.in'],
        companyId: null,
        mineId: null,
        beforeSummary: null,
        afterSummary: { baseline: 'CMR 2017 & Mines Act 1952', requirementsCount: 5 },
        metadata: { source: 'Statutory Gazette Notification' },
        occurredAt: new Date(Date.now() - 7 * 86400 * 1000),
      },
      {
        sequence: 2,
        action: 'MINE_GOVERNANCE_CONFIGURED',
        entityType: 'Mine',
        entityId: jhariaId,
        actorId: dbUsers['admin@coalmine.gov.in'],
        companyId: bcclCompany.id,
        mineId: jhariaId,
        beforeSummary: { status: 'DRAFT' },
        afterSummary: { status: 'ACTIVE', geoBoundary: 'GeoJSON Polygon WGS84' },
        metadata: { mineCode: 'BCCL-JHA-BLK4' },
        occurredAt: new Date(Date.now() - 5 * 86400 * 1000),
      },
      {
        sequence: 3,
        action: 'INSPECTION_CONDUCTED',
        entityType: 'Inspection',
        entityId: 'insp-seed-01',
        actorId: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        beforeSummary: { status: 'SCHEDULED' },
        afterSummary: { status: 'COMPLETED', observationsRecorded: 2 },
        metadata: { weather: 'Dry', shift: 'Morning' },
        occurredAt: new Date(Date.now() - 3 * 86400 * 1000),
      },
      {
        sequence: 4,
        action: 'VIOLATION_ELEVATED',
        entityType: 'Violation',
        entityId: 'viol-seed-01',
        actorId: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        beforeSummary: null,
        afterSummary: { severity: 'HIGH', status: 'OPEN', regulation: 'CMR 2017 Reg 108' },
        metadata: { sourceObservation: 'obs-seed-01' },
        occurredAt: new Date(Date.now() - 2 * 86400 * 1000),
      },
      {
        sequence: 5,
        action: 'GRIEVANCE_RESOLVED',
        entityType: 'Grievance',
        entityId: 'grv-demo-resolved-02',
        actorId: officialUserId,
        companyId: bcclCompany.id,
        mineId: jhariaId,
        beforeSummary: { status: 'IN_PROGRESS' },
        afterSummary: { status: 'RESOLVED', resolutionNote: 'Cleaned intake strainers and replaced 6 misting nozzles.' },
        metadata: { category: 'EQUIPMENT_SAFETY' },
        occurredAt: new Date(Date.now() - 3600 * 1000),
      },
    ];

    let currentPrevHash = GENESIS_PREV_HASH;
    for (const entry of auditEntries) {
      const canonical = canonicalizePayload({
        sequence: entry.sequence,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorId: entry.actorId,
        companyId: entry.companyId,
        mineId: entry.mineId,
        beforeSummary: entry.beforeSummary,
        afterSummary: entry.afterSummary,
        metadata: entry.metadata,
        occurredAt: entry.occurredAt.toISOString(),
        chainVersion: CHAIN_VERSION,
      });

      const payloadHash = computePayloadHash(canonical);
      const hmacHash = computeHmacChainHash(hmacSecret, currentPrevHash, payloadHash, entry.sequence);

      await prisma.auditLog.upsert({
        where: { sequence: entry.sequence },
        update: {
          prevHash: currentPrevHash,
          payloadHash,
          hmacHash,
        },
        create: {
          sequence: entry.sequence,
          occurredAt: entry.occurredAt,
          actorId: entry.actorId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          companyId: entry.companyId,
          mineId: entry.mineId,
          beforeSummary: entry.beforeSummary as any,
          afterSummary: entry.afterSummary as any,
          metadata: entry.metadata as any,
          prevHash: currentPrevHash,
          payloadHash,
          hmacHash,
          chainVersion: CHAIN_VERSION,
        },
      });

      currentPrevHash = hmacHash;
    }

    console.log(`  ✓ Phase 11 Demo: Seeded 5-Node Hash-Chained Tamper-Evident Audit Trail Segment (Genesis to Head)`);
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
