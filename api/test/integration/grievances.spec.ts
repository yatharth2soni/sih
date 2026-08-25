import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Grievance Handling (Phase 6)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let corporateTokenA: string;
  let corporateTokenB: string;
  let officialToken: string;
  let reporterToken: string;

  let adminUserId: string;
  let corporateUserIdA: string;
  let officialUserId: string;
  let reporterUserId: string;

  let companyAId: string;
  let companyBId: string;
  let mineA1Id: string;

  let grievance1Id: string;

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

    // 1. Create Companies & Mine
    const compA = await prisma.company.upsert({
      where: { code: 'GRV_CO_A' },
      update: {},
      create: { name: 'Grievance Test Company A', code: 'GRV_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'GRV_CO_B' },
      update: {},
      create: { name: 'Grievance Test Company B', code: 'GRV_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const mA1 = await prisma.mine.upsert({
      where: { code: 'GRV_MINE_A1' },
      update: {},
      create: { name: 'Grievance Mine A1 (Dhanbad)', code: 'GRV_MINE_A1', location: 'Dhanbad', companyId: companyAId },
    });
    mineA1Id = mA1.id;

    // 2. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-grv@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Grv', email: 'admin-grv@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-grv@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A Grv', email: 'corp-a-grv@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });
    corporateUserIdA = corpA.id;

    const corpB = await prisma.user.upsert({
      where: { email: 'corp-b-grv@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B Grv', email: 'corp-b-grv@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-grv@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Grv', email: 'official-grv@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    const reporter = await prisma.user.upsert({
      where: { email: 'worker-reporter@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Worker Reporter', email: 'worker-reporter@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    reporterUserId = reporter.id;

    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-grv@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-grv@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenA = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-grv@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenB = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-grv@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l4.body.data.accessToken;

    const l5 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'worker-reporter@coalindia.gov.in', password: 'Test@1234' });
    reporterToken = l5.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.grievanceComment.deleteMany({
        where: { grievance: { companyId: { in: [companyAId, companyBId] } } },
      });
      await prisma.grievanceStatusHistory.deleteMany({
        where: { grievance: { companyId: { in: [companyAId, companyBId] } } },
      });
      await prisma.grievance.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.mine.deleteMany({
        where: { id: mineA1Id },
      });
      for (const email of [
        'admin-grv@coalmine.gov.in',
        'corp-a-grv@coalindia.gov.in',
        'corp-b-grv@coalindia.gov.in',
        'official-grv@coalindia.gov.in',
        'worker-reporter@coalindia.gov.in',
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

  describe('1. Grievance Intake & SLA Derivation (/grievances)', () => {
    it('Reporter files an URGENT safety grievance (SLA = 24h)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          subject: 'Faulty High-Pressure Hydraulic Line on Excavator EX-04',
          description: 'High pressure hydraulic line leaking near operator cabin posing fire risk.',
          category: 'SAFETY',
          priority: 'URGENT',
          mineId: mineA1Id,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.subject).toContain('Faulty High-Pressure Hydraulic Line');
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.priority).toBe('URGENT');
      expect(res.body.data.slaDueAt).toBeDefined();

      const createdTime = new Date(res.body.data.createdAt).getTime();
      const slaTime = new Date(res.body.data.slaDueAt).getTime();
      const diffHours = Math.round((slaTime - createdTime) / (1000 * 3600));
      expect(diffHours).toBe(24); // 24h SLA for URGENT

      grievance1Id = res.body.data.id;
    });

    it('Reject grievance for foreign company mine (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${corporateTokenB}`)
        .send({
          subject: 'Cross Company Filing Attempt',
          description: 'Attempting to file for Mine A1',
          category: 'SAFETY',
          mineId: mineA1Id,
        })
        .expect(403);
    });
  });

  describe('2. Confidentiality & Comment Visibility Tiers (/grievances/:id/comments)', () => {
    it('Mine Official posts a public comment (REPORTER_AND_HANDLERS)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/comments`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          body: 'We have dispatched the mechanical maintenance team to inspect the hydraulic line.',
          visibility: 'REPORTER_AND_HANDLERS',
        })
        .expect(201);

      expect(res.body.data.visibility).toBe('REPORTER_AND_HANDLERS');
    });

    it('Mine Official posts an internal handler note (HANDLERS_ONLY)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/comments`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          body: 'Internal Note: Vendor replacement part is on backorder until tomorrow morning.',
          visibility: 'HANDLERS_ONLY',
        })
        .expect(201);

      expect(res.body.data.visibility).toBe('HANDLERS_ONLY');
    });

    it('Reporter views grievance: HANDLERS_ONLY comment is strictly stripped out', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grievances/${grievance1Id}`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .expect(200);

      expect(res.body.data.comments).toHaveLength(1);
      expect(res.body.data.comments[0].visibility).toBe('REPORTER_AND_HANDLERS');
      expect(res.body.data.comments.some((c: any) => c.body.includes('Internal Note'))).toBe(false);
    });

    it('Mine Official views grievance: sees all comments including HANDLERS_ONLY', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grievances/${grievance1Id}`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.comments.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.comments.some((c: any) => c.visibility === 'HANDLERS_ONLY')).toBe(true);
    });
  });

  describe('3. Status Lifecycle & Explicit Transitions', () => {
    it('Assign handler and auto-transition to IN_PROGRESS', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/assign`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({ assignedToId: officialUserId })
        .expect(201);

      expect(res.body.data.assignedToId).toBe(officialUserId);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.acknowledgedAt).toBeDefined();
    });

    it('Escalate grievance with mandatory reason', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/escalate`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ reason: 'Escalating to Corporate Safety Directorate due to repeated hydraulic failures.' })
        .expect(201);

      expect(res.body.data.status).toBe('ESCALATED');
    });

    it('Resolve grievance with mandatory resolutionNote', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/resolve`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({ resolutionNote: 'Replaced hydraulic line with reinforced SAE 100R2 assembly. Pressure tested to 350 bar.' })
        .expect(201);

      expect(res.body.data.status).toBe('RESOLVED');
      expect(res.body.data.resolvedAt).toBeDefined();
      expect(res.body.data.resolutionNote).toContain('Replaced hydraulic line');
    });

    it('Reject closing an un-resolved grievance (409 CONFLICT if invalid transition)', async () => {
      // Reopen first
      await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/reopen`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ reason: 'Slight oil drip still visible.' })
        .expect(201);

      // Now grievance is IN_PROGRESS -> attempt direct close
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/close`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ note: 'Closing directly' })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Re-resolve and successfully close grievance', async () => {
      // Resolve
      await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/resolve`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ resolutionNote: 'Tightened fitting collar and confirmed zero leak after 1 hour test.' })
        .expect(201);

      // Close
      const res = await request(app.getHttpServer())
        .post(`/api/v1/grievances/${grievance1Id}/close`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ note: 'Closed after reporter and safety officer inspection.' })
        .expect(201);

      expect(res.body.data.status).toBe('CLOSED');
      expect(res.body.data.closedAt).toBeDefined();
    });

    it('Audit history captures all transitions', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grievances/${grievance1Id}`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.statusHistory.length).toBeGreaterThanOrEqual(4);
      const statuses = res.body.data.statusHistory.map((h: any) => h.toStatus);
      expect(statuses).toContain('IN_PROGRESS');
      expect(statuses).toContain('ESCALATED');
      expect(statuses).toContain('RESOLVED');
      expect(statuses).toContain('CLOSED');
    });
  });
});
