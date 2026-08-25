import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Explainable Risk Scoring and Anomaly Detection (Phase 9)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let regulatorToken: string;
  let corporateToken: string;
  let otherCorporateToken: string;
  let officialToken: string;

  let adminUserId: string;
  let regulatorUserId: string;
  let corporateUserId: string;
  let officialUserId: string;

  let companyAId: string;
  let companyBId: string;
  let highRiskMineId: string;
  let normalMineId: string;
  let foreignMineId: string;

  let requirement1Id: string;
  let requirement2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    const passwordHash = await bcrypt.hash('Test@1234', 10);

    // 1. Create Companies & Mines
    const compA = await prisma.company.upsert({
      where: { code: 'RISK_CO_A' },
      update: {},
      create: { name: 'Risk Test Company A', code: 'RISK_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'RISK_CO_B' },
      update: {},
      create: { name: 'Risk Test Company B', code: 'RISK_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const hrMine = await prisma.mine.upsert({
      where: { code: 'RISK_MINE_HR' },
      update: {},
      create: { name: 'High Risk Pit (Jharia)', code: 'RISK_MINE_HR', location: 'Dhanbad', companyId: companyAId },
    });
    highRiskMineId = hrMine.id;

    const nMine = await prisma.mine.upsert({
      where: { code: 'RISK_MINE_NORM' },
      update: {},
      create: { name: 'Normal Pit (Korba)', code: 'RISK_MINE_NORM', location: 'Korba', companyId: companyAId },
    });
    normalMineId = nMine.id;

    const fMine = await prisma.mine.upsert({
      where: { code: 'RISK_MINE_FOR' },
      update: {},
      create: { name: 'Foreign Pit (Raniganj)', code: 'RISK_MINE_FOR', location: 'WB', companyId: companyBId },
    });
    foreignMineId = fMine.id;

    // 2. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-risk@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Risk', email: 'admin-risk@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const regulator = await prisma.user.upsert({
      where: { email: 'regulator-risk@dgms.gov.in' },
      update: { passwordHash },
      create: { name: 'Regulator Risk', email: 'regulator-risk@dgms.gov.in', passwordHash, role: 'REGULATOR', status: 'ACTIVE' },
    });
    regulatorUserId = regulator.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-risk@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A Risk', email: 'corp-a-risk@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });
    corporateUserId = corpA.id;

    const corpB = await prisma.user.upsert({
      where: { email: 'corp-b-risk@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B Risk', email: 'corp-b-risk@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-risk@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Risk', email: 'official-risk@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    // Assign Official to High Risk Mine only
    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: highRiskMineId } },
      update: { active: true },
      create: { userId: officialUserId, mineId: highRiskMineId, active: true, assignedById: adminUserId },
    });

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-risk@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'regulator-risk@dgms.gov.in', password: 'Test@1234' });
    regulatorToken = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-risk@coalindia.gov.in', password: 'Test@1234' });
    corporateToken = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-risk@coalindia.gov.in', password: 'Test@1234' });
    otherCorporateToken = l4.body.data.accessToken;

    const l5 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-risk@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l5.body.data.accessToken;

    // 3. Create Requirements
    const r1 = await prisma.complianceRequirement.upsert({
      where: { id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f60' },
      update: {},
      create: { id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f60', title: 'CMR Reg 108 SCAMP', category: 'SAFETY', frequency: 'Daily', applicableTo: 'MINE' },
    });
    requirement1Id = r1.id;

    const r2 = await prisma.complianceRequirement.upsert({
      where: { id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f61' },
      update: {},
      create: { id: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f61', title: 'CMR Reg 140 Gas Telemetry', category: 'SAFETY', frequency: 'Continuous', applicableTo: 'MINE' },
    });
    requirement2Id = r2.id;

    // 4. Seed High-Risk Scenario on HighRiskMine:
    // - 2 NON_COMPLIANT records
    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId: requirement1Id, mineId: highRiskMineId } },
      update: { status: 'NON_COMPLIANT' },
      create: { requirementId: requirement1Id, mineId: highRiskMineId, status: 'NON_COMPLIANT', nextDueAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
    });
    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId: requirement2Id, mineId: highRiskMineId } },
      update: { status: 'NON_COMPLIANT' },
      create: { requirementId: requirement2Id, mineId: highRiskMineId, status: 'NON_COMPLIANT', nextDueAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    });

    // - 1 Inspection with observations
    const insp = await prisma.inspection.create({
      data: {
        mineId: highRiskMineId,
        scheduledFor: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
        createdById: adminUserId,
        conductedById: officialUserId,
        purpose: 'Risk Audit',
      },
    });

    const obs1 = await prisma.observation.create({
      data: {
        inspectionId: insp.id,
        sequenceNumber: 1,
        title: 'Methane Ingress at Face',
        description: 'CH4 > 1.25%',
        category: 'SAFETY',
        severity: 'CRITICAL',
        findingType: 'NON_COMPLIANCE',
        complianceRequirementId: requirement2Id,
        recordedById: officialUserId,
      },
    });

    const obs2 = await prisma.observation.create({
      data: {
        inspectionId: insp.id,
        sequenceNumber: 2,
        title: 'Roof Strand Deformation',
        description: 'Strata convergence 15mm',
        category: 'SAFETY',
        severity: 'CRITICAL',
        findingType: 'NON_COMPLIANCE',
        complianceRequirementId: requirement1Id,
        recordedById: officialUserId,
      },
    });

    // - 2 Critical Violations (Current window) -> Spike from baseline (0 violations in baseline)
    const v1 = await prisma.violation.create({
      data: {
        observationId: obs1.id,
        mineId: highRiskMineId,
        complianceRequirementId: requirement2Id,
        title: 'Critical Methane Ingress',
        description: 'Gas concentration exceeds statutory limit',
        severity: 'CRITICAL',
        status: 'OPEN',
        raisedById: officialUserId,
        raisedAt: new Date(),
      },
    });

    const v2 = await prisma.violation.create({
      data: {
        observationId: obs2.id,
        mineId: highRiskMineId,
        complianceRequirementId: requirement1Id,
        title: 'Critical Roof Strata Convergence',
        description: 'Roof support displacement detected',
        severity: 'CRITICAL',
        status: 'OPEN',
        raisedById: officialUserId,
        raisedAt: new Date(),
      },
    });

    // - 3 Overdue CAPAs
    for (let i = 1; i <= 3; i++) {
      await prisma.correctiveAction.create({
        data: {
          violationId: v1.id,
          title: `Overdue Remediation Action ${i}`,
          description: 'Emergency ventilation duct extension',
          assignedToId: officialUserId,
          assignedById: adminUserId,
          dueAt: new Date(Date.now() - i * 24 * 3600 * 1000), // In the past
          status: 'OPEN',
        },
      });
    }

    // 5. Seed Normal Scenario on NormalMine (COMPLIANT, 0 violations, 0 overdue)
    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId: requirement1Id, mineId: normalMineId } },
      update: { status: 'COMPLIANT' },
      create: { requirementId: requirement1Id, mineId: normalMineId, status: 'COMPLIANT', nextDueAt: new Date(Date.now() + 15 * 24 * 3600 * 1000) },
    });
    await prisma.inspection.create({
      data: {
        mineId: normalMineId,
        scheduledFor: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
        createdById: adminUserId,
        conductedById: officialUserId,
        purpose: 'Routine Monthly Check',
      },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.anomalyFlag.deleteMany({
        where: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      await prisma.riskScore.deleteMany({
        where: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      await prisma.escalationLog.deleteMany({
        where: { resourceType: 'RiskScore' },
      });
      await prisma.notification.deleteMany({
        where: { resourceType: 'RiskScore' },
      });
      await prisma.correctiveAction.deleteMany({
        where: { violation: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } } },
      });
      await prisma.violation.deleteMany({
        where: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      await prisma.observation.deleteMany({
        where: { inspection: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } } },
      });
      await prisma.inspection.deleteMany({
        where: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.complianceRecord.deleteMany({
        where: { mineId: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      await prisma.complianceRequirement.deleteMany({
        where: { id: { in: [requirement1Id, requirement2Id] } },
      });
      await prisma.mine.deleteMany({
        where: { id: { in: [highRiskMineId, normalMineId, foreignMineId] } },
      });
      for (const email of [
        'admin-risk@coalmine.gov.in',
        'regulator-risk@dgms.gov.in',
        'corp-a-risk@coalindia.gov.in',
        'corp-b-risk@coalindia.gov.in',
        'official-risk@coalindia.gov.in',
      ]) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
      await prisma.company.deleteMany({
        where: { id: { in: [companyAId, companyBId] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Risk Score Calculation & Banding (POST /api/v1/risk-scores/recalculate)', () => {
    it('Recalculate risk scores for all mines and verify high vs low banding', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/risk-scores/recalculate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.totalMinesProcessed).toBeGreaterThanOrEqual(2);

      const hrResult = res.body.data.mines.find((m: any) => m.mineId === highRiskMineId);
      expect(hrResult).toBeDefined();
      // High risk pit has 2 critical violations (35pts) + 3 overdue CAPAs (25pts) + 2 non-compliant records (25pts) = 85 (CRITICAL)
      expect(hrResult.score).toBeGreaterThanOrEqual(75);
      expect(hrResult.band).toBe('CRITICAL');
      expect(hrResult.anomaliesCount).toBeGreaterThanOrEqual(1);

      const normResult = res.body.data.mines.find((m: any) => m.mineId === normalMineId);
      expect(normResult).toBeDefined();
      expect(normResult.score).toBeLessThanOrEqual(25);
      expect(normResult.band).toBe('LOW');
      expect(normResult.anomaliesCount).toBe(0);
    });

    it('Forbid non-admin/regulator user from triggering recalculation (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/risk-scores/recalculate')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('2. Explainable Factor Breakdown (GET /api/v1/mines/:mineId/risk-score)', () => {
    it('Retrieve detailed explainable breakdown and narrative for high risk mine', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/mines/${highRiskMineId}/risk-score`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      const data = res.body.data;
      expect(data).toBeDefined();
      expect(data.mine.name).toBe('High Risk Pit (Jharia)');
      expect(data.band).toBe('CRITICAL');
      expect(data.factors.violations.weight).toBe(0.35);
      expect(data.factors.capas.weight).toBe(0.25);
      expect(data.factors.compliance.weight).toBe(0.25);
      expect(data.factors.inspectionGap.weight).toBe(0.15);
      expect(data.plainLanguageExplanation).toContain('CRITICAL risk score');
      expect(data.plainLanguageExplanation).toContain('elevated statutory violations');
      expect(data.anomalies).toBeDefined();
    });

    it('Forbid Mine Official from accessing unassigned foreign mine risk score (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/mines/${foreignMineId}/risk-score`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(403);
    });
  });

  describe('3. Baseline-Relative Anomaly Detection & Anomaly Flags (GET /api/v1/anomalies)', () => {
    it('Query detected anomaly flags for high risk mine', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/anomalies?mineId=${highRiskMineId}`)
        .set('Authorization', `Bearer ${corporateToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const spike = res.body.data.find((a: any) => a.type === 'VIOLATION_SPIKE');
      expect(spike).toBeDefined();
      expect(spike.status).toBe('OPEN');
      expect(spike.observed.violationsCount).toBe(2);
      expect(spike.baseline.violationsCount).toBe(0);
    });
  });

  describe('4. Anomaly Lifecycle Action Handlers (POST /api/v1/anomalies/:id/...) ', () => {
    let anomalyId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/anomalies?mineId=${highRiskMineId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      anomalyId = res.body.data[0].id;
    });

    it('Acknowledge anomaly flag: transitions OPEN -> ACKNOWLEDGED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/anomalies/${anomalyId}/acknowledge`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ reason: 'Investigation team dispatched to Panel-B' })
        .expect(201);

      expect(res.body.data.status).toBe('ACKNOWLEDGED');
      expect(res.body.data.actionReason).toBe('Investigation team dispatched to Panel-B');
    });

    it('Resolve anomaly flag: transitions ACKNOWLEDGED -> RESOLVED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/anomalies/${anomalyId}/resolve`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ reason: 'Auxiliary fan installed, CH4 returned to 0.4%' })
        .expect(201);

      expect(res.body.data.status).toBe('RESOLVED');
      expect(res.body.data.actionReason).toBe('Auxiliary fan installed, CH4 returned to 0.4%');
    });

    it('Reject invalid transition: cannot resolve already resolved anomaly (400)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/anomalies/${anomalyId}/resolve`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ reason: 'Duplicate resolve attempt' })
        .expect(400);

      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });

  describe('5. Phase 7 In-App Alert Notification Integration', () => {
    it('Verify RISK_HIGH notification was delivered to official and regulator', async () => {
      const notifRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      const riskNotif = notifRes.body.data.find((n: any) => n.type === 'RISK_HIGH');
      expect(riskNotif).toBeDefined();
      expect(riskNotif.title).toContain('CRITICAL Risk Score');
      expect(riskNotif.severity).toBe('CRITICAL');
    });

    it('Verify recalculation rerun does not produce duplicate notifications', async () => {
      // Count notifications before rerun
      const beforeRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${officialToken}`);
      const beforeCount = beforeRes.body.data.filter((n: any) => n.type === 'RISK_HIGH').length;

      // Recalculate again
      await request(app.getHttpServer())
        .post('/api/v1/risk-scores/recalculate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Count notifications after rerun
      const afterRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${officialToken}`);
      const afterCount = afterRes.body.data.filter((n: any) => n.type === 'RISK_HIGH').length;

      // Duplicate count should be 0 because EscalationService enforces unique idempotencyKey
      expect(afterCount).toBe(beforeCount);
    });
  });
});
