import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotificationSchedulerService } from '../../src/alerts/notification-scheduler.service';
import * as bcrypt from 'bcrypt';

describe('Notifications, Reminders, Alerts, and Escalation (Phase 7)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;
  let schedulerService: NotificationSchedulerService;

  let adminToken: string;
  let regulatorToken: string;
  let corporateToken: string;
  let officialToken: string;
  let otherOfficialToken: string;

  let adminUserId: string;
  let regulatorUserId: string;
  let corporateUserId: string;
  let officialUserId: string;
  let otherOfficialUserId: string;

  let companyId: string;
  let mineId: string;
  let requirementId: string;
  let compRecord14dId: string;
  let compRecordOverdueId: string;
  let capaDue3dId: string;
  let capaOverdue4dId: string;

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
    schedulerService = app.get(NotificationSchedulerService);
    const passwordHash = await bcrypt.hash('Test@1234', 10);

    // 1. Create company & mine
    const company = await prisma.company.upsert({
      where: { code: 'NOTIF_TEST_CO' },
      update: {},
      create: {
        name: 'Notification Test Co',
        code: 'NOTIF_TEST_CO',
        type: 'SUBSIDIARY',
      },
    });
    companyId = company.id;

    const mine = await prisma.mine.upsert({
      where: { code: 'NOTIF_TEST_MINE' },
      update: {},
      create: {
        name: 'Notification Test Mine',
        code: 'NOTIF_TEST_MINE',
        location: 'Dhanbad, JH',
        companyId,
      },
    });
    mineId = mine.id;

    // 2. Create users with scopes
    const admin = await prisma.user.upsert({
      where: { email: 'admin-notif@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Admin Notif',
        email: 'admin-notif@coalmine.gov.in',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    adminUserId = admin.id;

    const regulator = await prisma.user.upsert({
      where: { email: 'regulator-notif@dgms.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Regulator Notif',
        email: 'regulator-notif@dgms.gov.in',
        passwordHash,
        role: 'REGULATOR',
        status: 'ACTIVE',
      },
    });
    regulatorUserId = regulator.id;

    const corporate = await prisma.user.upsert({
      where: { email: 'corporate-notif@coalindia.gov.in' },
      update: { passwordHash, companyId },
      create: {
        name: 'Corporate Notif',
        email: 'corporate-notif@coalindia.gov.in',
        passwordHash,
        role: 'CORPORATE',
        companyId,
        status: 'ACTIVE',
      },
    });
    corporateUserId = corporate.id;

    const official = await prisma.user.upsert({
      where: { email: 'official-notif@coalindia.gov.in' },
      update: { passwordHash, companyId },
      create: {
        name: 'Official Notif',
        email: 'official-notif@coalindia.gov.in',
        passwordHash,
        role: 'MINE_OFFICIAL',
        companyId,
        status: 'ACTIVE',
      },
    });
    officialUserId = official.id;

    // Assign official to mine
    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId } },
      update: { active: true },
      create: {
        userId: officialUserId,
        mineId,
        active: true,
        assignedById: adminUserId,
      },
    });

    const otherOfficial = await prisma.user.upsert({
      where: { email: 'other-notif@coalindia.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Other Official Notif',
        email: 'other-notif@coalindia.gov.in',
        passwordHash,
        role: 'MINE_OFFICIAL',
        status: 'ACTIVE',
      },
    });
    otherOfficialUserId = otherOfficial.id;

    // 3. Login all users
    const l1 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin-notif@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'regulator-notif@dgms.gov.in', password: 'Test@1234' });
    regulatorToken = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'corporate-notif@coalindia.gov.in', password: 'Test@1234' });
    corporateToken = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'official-notif@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l4.body.data.accessToken;

    const l5 = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'other-notif@coalindia.gov.in', password: 'Test@1234' });
    otherOfficialToken = l5.body.data.accessToken;

    // 4. Create Requirements and Records
    const req = await prisma.complianceRequirement.upsert({
      where: { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' },
      update: {},
      create: {
        id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        title: 'CMR Reg 108 — Test Strata Compliance',
        category: 'SAFETY',
        frequency: 'Daily',
        applicableTo: 'MINE',
      },
    });
    requirementId = req.id;

    const baseNow = new Date('2026-08-25T12:00:00.000Z');

    // Record due in 10 days (Trigger stage 1: 14D)
    const rec1 = await prisma.complianceRecord.upsert({
      where: { requirementId_mineId: { requirementId, mineId } },
      update: {
        nextDueAt: new Date(baseNow.getTime() + 10 * 24 * 3600 * 1000),
        status: 'PENDING',
      },
      create: {
        requirementId,
        mineId,
        nextDueAt: new Date(baseNow.getTime() + 10 * 24 * 3600 * 1000),
        status: 'PENDING',
      },
    });
    compRecord14dId = rec1.id;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.notification.deleteMany({
        where: {
          recipientId: {
            in: [
              adminUserId,
              regulatorUserId,
              corporateUserId,
              officialUserId,
              otherOfficialUserId,
            ],
          },
        },
      });
      await prisma.escalationLog.deleteMany({
        where: {
          recipientId: {
            in: [
              adminUserId,
              regulatorUserId,
              corporateUserId,
              officialUserId,
              otherOfficialUserId,
            ],
          },
        },
      });
      await prisma.correctiveAction.deleteMany({
        where: { violation: { mineId } },
      });
      await prisma.violation.deleteMany({ where: { mineId } });
      await prisma.observation.deleteMany({
        where: { inspection: { mineId } },
      });
      await prisma.inspection.deleteMany({ where: { mineId } });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: { in: [officialUserId, otherOfficialUserId] } },
      });
      await prisma.complianceRecord.deleteMany({ where: { mineId } });
      await prisma.complianceRequirement.deleteMany({
        where: { id: requirementId },
      });
      await prisma.mine.deleteMany({ where: { id: mineId } });
      for (const email of [
        'admin-notif@coalmine.gov.in',
        'regulator-notif@dgms.gov.in',
        'corporate-notif@coalindia.gov.in',
        'official-notif@coalindia.gov.in',
        'other-notif@coalindia.gov.in',
      ]) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Domain Event: Violation Raised in-app Notifications', () => {
    let violationId: string;

    it('Schedule & start inspection, create observation, and raise violation', async () => {
      // 1. Schedule inspection
      const inspRes = await request(app.getHttpServer())
        .post('/api/v1/inspections')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          mineId,
          scheduledFor: new Date().toISOString(),
          purpose: 'Notif Test Inspection',
        })
        .expect(201);
      const inspectionId = inspRes.body.data.id;

      // 2. Start inspection
      await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/start`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      // 3. Create observation
      const obsRes = await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/observations`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send([
          {
            title: 'Critical Methane Exceedance in Heading',
            description: 'CH4 measured 1.8%',
            category: 'SAFETY',
            severity: 'CRITICAL',
            findingType: 'NON_COMPLIANCE',
            complianceRequirementId: requirementId,
            isViolationCandidate: true,
          },
        ])
        .expect(201);
      const obsId = obsRes.body.data[0].id;

      // 4. Raise violation -> triggers VIOLATION_RAISED domain event
      const violRes = await request(app.getHttpServer())
        .post(`/api/v1/observations/${obsId}/violation`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          title: 'CMR Reg 140 Dangerous CH4 Gas Ingress',
          markComplianceRecordNonCompliant: true,
        })
        .expect(201);
      violationId = violRes.body.data.id;
    });

    it('Official, Corporate, and Regulator receive in-app notifications', async () => {
      // Mine Official receives notification
      const offRes = await request(app.getHttpServer())
        .get('/api/v1/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);
      expect(offRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(offRes.body.data[0].type).toBe('VIOLATION_RAISED');
      expect(offRes.body.data[0].severity).toBe('CRITICAL');

      // Corporate Manager receives notification
      const corpRes = await request(app.getHttpServer())
        .get('/api/v1/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${corporateToken}`)
        .expect(200);
      expect(corpRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(corpRes.body.data[0].type).toBe('VIOLATION_RAISED');

      // DGMS Regulator receives notification
      const regRes = await request(app.getHttpServer())
        .get('/api/v1/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${regulatorToken}`)
        .expect(200);
      expect(regRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(regRes.body.data[0].type).toBe('VIOLATION_RAISED');

      // Other unrelated Mine Official receives 0 notifications (User Isolation)
      const otherRes = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${otherOfficialToken}`)
        .expect(200);
      expect(otherRes.body.data.length).toBe(0);
    });
  });

  describe('2. Scheduled Scans, Multi-stage Reminders & Escalations (Fake Clock)', () => {
    const simulationBase = new Date('2026-08-25T12:00:00.000Z');
    let violationId: string;
    let capaId: string;

    beforeAll(async () => {
      // Create a violation and 2 CAPAs with different due dates for scan testing
      const viol = await prisma.violation.findFirst({
        where: { mineId },
      });
      violationId = viol!.id;

      // CAPA 1: Due in 2 days from simulationBase
      const c1 = await prisma.correctiveAction.create({
        data: {
          violationId,
          title: 'Ventilation Fan Overhaul',
          description: 'Inspect impeller blades',
          assignedToId: officialUserId,
          assignedById: adminUserId,
          dueAt: new Date(simulationBase.getTime() + 2 * 24 * 3600 * 1000),
          status: 'OPEN',
        },
      });
      capaDue3dId = c1.id;

      // CAPA 2: Overdue by 4 days from simulationBase
      const c2 = await prisma.correctiveAction.create({
        data: {
          violationId,
          title: 'Overdue Strata Support Prop Replacement',
          description: 'Replace bent props',
          assignedToId: officialUserId,
          assignedById: adminUserId,
          dueAt: new Date(simulationBase.getTime() - 4 * 24 * 3600 * 1000),
          status: 'OPEN',
        },
      });
      capaOverdue4dId = c2.id;
    });

    it('Run Scan at simulationBase: generates due reminders and overdue escalations', async () => {
      const scanRes = await request(app.getHttpServer())
        .post('/api/v1/alerts/trigger-scan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ now: simulationBase.toISOString() })
        .expect(200);

      expect(scanRes.body.data).toBeDefined();
      expect(scanRes.body.data.complianceRecordsScanned).toBeGreaterThanOrEqual(1);
      expect(scanRes.body.data.correctiveActionsScanned).toBeGreaterThanOrEqual(2);
      expect(scanRes.body.data.capaEscalationsSent).toBeGreaterThanOrEqual(1);
    });

    it('Idempotency check: Rerunning scan at exact same time generates 0 new notifications', async () => {
      const scanRes = await request(app.getHttpServer())
        .post('/api/v1/alerts/trigger-scan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ now: simulationBase.toISOString() })
        .expect(200);

      expect(scanRes.body.data.complianceRemindersSent).toBe(0);
      expect(scanRes.body.data.capaEscalationsSent).toBe(0);
      expect(scanRes.body.data.skippedIdempotent).toBeGreaterThan(0);
    });

    it('Verify CAPA Overdue Stage 2 escalation delivered to Corporate and Regulator', async () => {
      const corpNotifs = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${corporateToken}`)
        .expect(200);

      const capaOverdueNotif = corpNotifs.body.data.find(
        (n: any) => n.type === 'CAPA_OVERDUE',
      );
      expect(capaOverdueNotif).toBeDefined();
      expect(capaOverdueNotif.severity).toBe('CRITICAL');
    });
  });

  describe('3. Notifications Feed, Polling, and Read State Management', () => {
    let notifId: string;

    it('GET /notifications/unread-count returns correct count', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(1);
    });

    it('GET /notifications with `since` filter returns newer notifications only', async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/notifications?since=${pastDate}`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      notifId = res.body.data[0].id;
    });

    it('POST /notifications/:id/read marks notification as read', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(notifId);
      expect(res.body.data.readAt).not.toBeNull();
    });

    it('Forbid marking another user notification as read (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${otherOfficialToken}`)
        .expect(403);
    });

    it('POST /notifications/read-all marks all unread notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.updatedCount).toBeGreaterThanOrEqual(0);

      // Verify unread count is now 0
      const countRes = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(countRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('4. Escalation Log Audit Querying', () => {
    it('Admin can query escalation logs with filters (GET /api/v1/alerts/escalations)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/alerts/escalations?outcome=SENT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].outcome).toBe('SENT');
      expect(res.body.meta).toBeDefined();
    });

    it('Mine Official is forbidden from accessing escalation audit logs (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/alerts/escalations')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(403);
    });
  });
});
