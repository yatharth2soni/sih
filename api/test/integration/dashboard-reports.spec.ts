import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Dashboard Aggregation and Statutory Reporting (Phase 8)', () => {
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
  let otherCorporateUserId: string;
  let officialUserId: string;

  let companyAId: string;
  let companyBId: string;
  let mineA1Id: string;
  let mineA2Id: string;
  let mineB1Id: string;

  let requirementId: string;

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

    // 1. Create 2 Companies & 3 Mines
    const compA = await prisma.company.upsert({
      where: { code: 'DASH_CO_A' },
      update: {},
      create: { name: 'Dashboard Company A', code: 'DASH_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'DASH_CO_B' },
      update: {},
      create: { name: 'Dashboard Company B', code: 'DASH_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const mA1 = await prisma.mine.upsert({
      where: { code: 'DASH_MINE_A1' },
      update: {},
      create: { name: 'Mine A1 (Jharia)', code: 'DASH_MINE_A1', location: 'Dhanbad', companyId: companyAId },
    });
    mineA1Id = mA1.id;

    const mA2 = await prisma.mine.upsert({
      where: { code: 'DASH_MINE_A2' },
      update: {},
      create: { name: 'Mine A2 (Korba)', code: 'DASH_MINE_A2', location: 'Korba', companyId: companyAId },
    });
    mineA2Id = mA2.id;

    const mB1 = await prisma.mine.upsert({
      where: { code: 'DASH_MINE_B1' },
      update: {},
      create: { name: 'Mine B1 (Raniganj)', code: 'DASH_MINE_B1', location: 'WB', companyId: companyBId },
    });
    mineB1Id = mB1.id;

    // 2. Create Users with Scopes
    const admin = await prisma.user.upsert({
      where: { email: 'admin-dash@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Dash', email: 'admin-dash@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const regulator = await prisma.user.upsert({
      where: { email: 'regulator-dash@dgms.gov.in' },
      update: { passwordHash },
      create: { name: 'Regulator Dash', email: 'regulator-dash@dgms.gov.in', passwordHash, role: 'REGULATOR', status: 'ACTIVE' },
    });
    regulatorUserId = regulator.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A User', email: 'corp-a@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });
    corporateUserId = corpA.id;

    const corpB = await prisma.user.upsert({
      where: { email: 'corp-b@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B User', email: 'corp-b@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });
    otherCorporateUserId = corpB.id;

    const official = await prisma.user.upsert({
      where: { email: 'official-dash@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Dash', email: 'official-dash@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    // Assign Official to Mine A1 only
    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // 3. Login Users
    const l1 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin-dash@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'regulator-dash@dgms.gov.in', password: 'Test@1234' });
    regulatorToken = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'corp-a@coalindia.gov.in', password: 'Test@1234' });
    corporateToken = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'corp-b@coalindia.gov.in', password: 'Test@1234' });
    otherCorporateToken = l4.body.data.accessToken;

    const l5 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'official-dash@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l5.body.data.accessToken;

    // 4. Create Compliance Requirements & Records with formula-injection string test
    const req = await prisma.complianceRequirement.upsert({
      where: { id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f' },
      update: {},
      create: {
        id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
        title: 'CMR Reg 108 — SCAMP Strata Control',
        category: 'SAFETY',
        frequency: 'Daily',
        applicableTo: 'MINE',
      },
    });
    requirementId = req.id;

    // Create records across mines
    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId, mineId: mineA1Id } },
      update: { status: 'COMPLIANT', remarks: '=cmd|\' /C calc\'!A0' }, // Formula injection test payload
      create: {
        requirementId,
        mineId: mineA1Id,
        status: 'COMPLIANT',
        remarks: '=cmd|\' /C calc\'!A0',
        nextDueAt: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      },
    });

    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId, mineId: mineA2Id } },
      update: { status: 'NON_COMPLIANT' },
      create: {
        requirementId,
        mineId: mineA2Id,
        status: 'NON_COMPLIANT',
        nextDueAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
    });

    await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId, mineId: mineB1Id } },
      update: { status: 'PENDING' },
      create: {
        requirementId,
        mineId: mineB1Id,
        status: 'PENDING',
        nextDueAt: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      },
    });

    // 5. Create Inspection, Observation, Violation, CAPA for Mine A1
    const insp = await prisma.inspection.create({
      data: {
        mineId: mineA1Id,
        scheduledFor: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
        createdById: adminUserId,
        conductedById: officialUserId,
        purpose: 'Dash Test Inspection',
      },
    });

    const obs = await prisma.observation.create({
      data: {
        inspectionId: insp.id,
        sequenceNumber: 1,
        title: 'Roof Bolt Tension Drift',
        description: 'Tension low on junction',
        category: 'SAFETY',
        severity: 'CRITICAL',
        findingType: 'NON_COMPLIANCE',
        complianceRequirementId: requirementId,
        recordedById: officialUserId,
      },
    });

    const viol = await prisma.violation.create({
      data: {
        observationId: obs.id,
        mineId: mineA1Id,
        complianceRequirementId: requirementId,
        title: 'Critical Roof Strata Violation',
        description: 'Critical roof bolt tension drift exceeding 10mm limit',
        severity: 'CRITICAL',
        status: 'OPEN',
        raisedById: officialUserId,
      },
    });

    await prisma.correctiveAction.create({
      data: {
        violationId: viol.id,
        title: 'Install 4 additional props',
        description: 'Remediate strata drift',
        assignedToId: officialUserId,
        assignedById: adminUserId,
        dueAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        status: 'OPEN',
      },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.correctiveAction.deleteMany({
        where: { violation: { mineId: { in: [mineA1Id, mineA2Id, mineB1Id] } } },
      });
      await prisma.violation.deleteMany({
        where: { mineId: { in: [mineA1Id, mineA2Id, mineB1Id] } },
      });
      await prisma.observation.deleteMany({
        where: { inspection: { mineId: { in: [mineA1Id, mineA2Id, mineB1Id] } } },
      });
      await prisma.inspection.deleteMany({
        where: { mineId: { in: [mineA1Id, mineA2Id, mineB1Id] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.complianceRecord.deleteMany({
        where: { mineId: { in: [mineA1Id, mineA2Id, mineB1Id] } },
      });
      await prisma.complianceRequirement.deleteMany({
        where: { id: requirementId },
      });
      await prisma.mine.deleteMany({
        where: { id: { in: [mineA1Id, mineA2Id, mineB1Id] } },
      });
      for (const email of [
        'admin-dash@coalmine.gov.in',
        'regulator-dash@dgms.gov.in',
        'corp-a@coalindia.gov.in',
        'corp-b@coalindia.gov.in',
        'official-dash@coalindia.gov.in',
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

  describe('1. Mine Overview Dashboard (GET /api/v1/dashboard/mine/:mineId/overview)', () => {
    it('Fetch Mine A1 Overview as assigned Mine Official', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dashboard/mine/${mineA1Id}/overview`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.mine.name).toBe('Mine A1 (Jharia)');
      expect(res.body.data.kpis.complianceRate.value).toBe(100.0);
      expect(res.body.data.kpis.inspections.completed).toBe(1);
      expect(res.body.data.kpis.inspections.completionRate).toBe(100.0);
      expect(res.body.data.kpis.violations.current).toBe(1);
      expect(res.body.data.distributions.severity.CRITICAL).toBe(1);
      expect(res.body.data.kpis.capa.open).toBe(1);
      expect(res.body.data.trends).toBeDefined();
      expect(Array.isArray(res.body.data.trends)).toBe(true);
    });

    it('Forbid Mine Official from accessing unassigned Mine B1 (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/dashboard/mine/${mineB1Id}/overview`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(403);
    });
  });

  describe('2. Company Overview Dashboard (GET /api/v1/dashboard/company/:companyId/overview)', () => {
    it('Corporate User A views Company A Multi-mine Rollup & Top At-Risk Mines', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dashboard/company/${companyAId}/overview`)
        .set('Authorization', `Bearer ${corporateToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.company.code).toBe('DASH_CO_A');
      expect(res.body.data.totalMines).toBe(2);
      expect(res.body.data.topAtRiskMines).toBeDefined();
      expect(res.body.data.topAtRiskMines.length).toBe(2);
      // Mine A1 has critical open violation -> top rank
      expect(res.body.data.topAtRiskMines[0].mineCode).toBe('DASH_MINE_A1');
    });

    it('Corporate User B is FORBIDDEN from viewing Company A (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/dashboard/company/${companyAId}/overview`)
        .set('Authorization', `Bearer ${otherCorporateToken}`)
        .expect(403);
    });
  });

  describe('3. Regulator Statutory Overview (GET /api/v1/dashboard/regulator/overview)', () => {
    it('Regulator accesses National Overview with Subsidiary Comparisons', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/regulator/overview')
        .set('Authorization', `Bearer ${regulatorToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.jurisdiction).toContain('DGMS');
      expect(res.body.data.subsidiaryComparisons).toBeDefined();
      expect(res.body.data.subsidiaryComparisons.length).toBeGreaterThanOrEqual(2);
    });

    it('Corporate User is FORBIDDEN from accessing Regulator Overview (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dashboard/regulator/overview')
        .set('Authorization', `Bearer ${corporateToken}`)
        .expect(403);
    });
  });

  describe('4. Tabular Compliance Report (GET /api/v1/reports/compliance)', () => {
    it('Query scoped tabular compliance records with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/compliance?pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('5. Statutory Report Exports (CSV & XLSX with Formula Escaping)', () => {
    it('Export CSV format: verifies Content-Disposition header and RFC 4180 content', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/statutory/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="statutory-compliance-report-');

      // Formula injection test assertion: '=cmd...' MUST be sanitized to '=cmd...'
      const csvText = res.text;
      expect(csvText).toContain("'=cmd|' /C calc'!A0");
    });

    it('Export XLSX format: verifies binary Excel spreadsheet content', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/statutory/export?format=xlsx')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.headers['content-disposition']).toContain('attachment; filename="statutory-compliance-report-');
      expect(res.body).toBeDefined();
    });

    it('Reject export date range > 365 days (400 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/statutory/export?format=csv&from=2024-01-01T00:00:00Z&to=2026-01-01T00:00:00Z')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
