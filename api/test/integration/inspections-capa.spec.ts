import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Inspections to CAPA Workflow (Integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let mineOfficialToken: string;
  let unauthorizedOfficialToken: string;

  let testMineId: string;
  let otherMineId: string;
  let testCompanyId: string;
  let testRequirementId: string;
  let testRecordId: string;

  let adminUserId: string;
  let mineOfficialUserId: string;
  let unauthOfficialUserId: string;

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

    // 1. Create company
    const company = await prisma.company.upsert({
      where: { code: 'TEST_CO_PHASE2' },
      update: {},
      create: {
        name: 'Test Mining Corporation',
        code: 'TEST_CO_PHASE2',
        type: 'SUBSIDIARY',
      },
    });
    testCompanyId = company.id;

    // 2. Create mines
    const mine1 = await prisma.mine.upsert({
      where: { code: 'TEST_MINE_P2_A' },
      update: {},
      create: {
        name: 'Test Mine Alpha',
        code: 'TEST_MINE_P2_A',
        location: 'Dhanbad, Jharkhand',
        companyId: testCompanyId,
      },
    });
    testMineId = mine1.id;

    const mine2 = await prisma.mine.upsert({
      where: { code: 'TEST_MINE_P2_B' },
      update: {},
      create: {
        name: 'Test Mine Beta',
        code: 'TEST_MINE_P2_B',
        location: 'Raniganj, WB',
        companyId: testCompanyId,
      },
    });
    otherMineId = mine2.id;

    // 3. Create requirement & record
    const req = await prisma.complianceRequirement.upsert({
      where: { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' },
      update: {},
      create: {
        id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        title: 'CMR Reg. 108 Strata Monitoring Test',
        category: 'SAFETY',
        frequency: 'Daily',
        applicableTo: 'MINE',
      },
    });
    testRequirementId = req.id;

    const rec = await prisma.complianceRecord.upsert({
      where: {
        requirementId_mineId: {
          requirementId: testRequirementId,
          mineId: testMineId,
        },
      },
      update: { status: 'COMPLIANT' },
      create: {
        requirementId: testRequirementId,
        mineId: testMineId,
        status: 'COMPLIANT',
        remarks: 'Initial compliant state',
      },
    });
    testRecordId = rec.id;

    // 4. Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin-p2@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Admin Phase 2',
        email: 'admin-p2@coalmine.gov.in',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    adminUserId = adminUser.id;

    // 5. Create Mine Official with assignment to testMineId
    const officialUser = await prisma.user.upsert({
      where: { email: 'official-p2@coalmine.gov.in' },
      update: { passwordHash, companyId: testCompanyId },
      create: {
        name: 'Official Phase 2',
        email: 'official-p2@coalmine.gov.in',
        passwordHash,
        role: 'MINE_OFFICIAL',
        companyId: testCompanyId,
        status: 'ACTIVE',
      },
    });
    mineOfficialUserId = officialUser.id;

    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: mineOfficialUserId, mineId: testMineId } },
      update: { active: true },
      create: {
        userId: mineOfficialUserId,
        mineId: testMineId,
        active: true,
        assignedById: adminUserId,
      },
    });

    // 6. Create Unauthorized Official (no assignment to testMineId)
    const otherCompany = await prisma.company.upsert({
      where: { code: 'OTHER_CO_P2' },
      update: {},
      create: {
        name: 'Other Mining Co',
        code: 'OTHER_CO_P2',
        type: 'SUBSIDIARY',
      },
    });

    const unauthOfficial = await prisma.user.upsert({
      where: { email: 'unauth-p2@coalmine.gov.in' },
      update: { passwordHash, companyId: otherCompany.id },
      create: {
        name: 'Unauth Official',
        email: 'unauth-p2@coalmine.gov.in',
        passwordHash,
        role: 'MINE_OFFICIAL',
        companyId: otherCompany.id,
        status: 'ACTIVE',
      },
    });
    unauthOfficialUserId = unauthOfficial.id;

    // Login users to obtain tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin-p2@coalmine.gov.in', password: 'Test@1234' });
    adminToken = adminLogin.body.data.accessToken;

    const officialLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'official-p2@coalmine.gov.in', password: 'Test@1234' });
    mineOfficialToken = officialLogin.body.data.accessToken;

    const unauthLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'unauth-p2@coalmine.gov.in', password: 'Test@1234' });
    unauthorizedOfficialToken = unauthLogin.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      // Clean up records, violations, observations, inspections
      await prisma.correctiveAction.deleteMany({
        where: { violation: { mineId: { in: [testMineId, otherMineId] } } },
      });
      await prisma.violation.deleteMany({
        where: { mineId: { in: [testMineId, otherMineId] } },
      });
      await prisma.observation.deleteMany({
        where: { inspection: { mineId: { in: [testMineId, otherMineId] } } },
      });
      await prisma.inspection.deleteMany({
        where: { mineId: { in: [testMineId, otherMineId] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: { in: [mineOfficialUserId, unauthOfficialUserId] } },
      });
      await prisma.complianceRecord.deleteMany({
        where: { mineId: { in: [testMineId, otherMineId] } },
      });
      await prisma.complianceRequirement.deleteMany({
        where: { id: testRequirementId },
      });
      await prisma.mine.deleteMany({
        where: { id: { in: [testMineId, otherMineId] } },
      });
      for (const email of [
        'admin-p2@coalmine.gov.in',
        'official-p2@coalmine.gov.in',
        'unauth-p2@coalmine.gov.in',
      ]) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) {
          await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
        }
      }
      await prisma.company.deleteMany({
        where: { code: { in: ['TEST_CO_PHASE2', 'OTHER_CO_P2'] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Full Operational Workflow: Inspection -> Observations -> Violation -> CAPA -> Closure -> Resolution', () => {
    let inspectionId: string;
    let observation1Id: string;
    let observation2Id: string;
    let violationId: string;
    let capaId: string;

    it('1. Schedule Inspection (POST /api/v1/inspections)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/inspections')
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          mineId: testMineId,
          scheduledFor: new Date(Date.now() + 86400000).toISOString(),
          purpose: 'Routine Monthly Shift Inspection',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('SCHEDULED');
      expect(res.body.data.mineId).toBe(testMineId);
      inspectionId = res.body.data.id;
    });

    it('2. Deny unauthorized official cross-mine access (POST /api/v1/inspections)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/inspections')
        .set('Authorization', `Bearer ${unauthorizedOfficialToken}`)
        .send({
          mineId: testMineId,
          scheduledFor: new Date(Date.now() + 86400000).toISOString(),
          purpose: 'Cross-mine illicit attempt',
        })
        .expect(403);
    });

    it('3. Reschedule Inspection while SCHEDULED (PATCH /api/v1/inspections/:id)', async () => {
      const newDate = new Date(Date.now() + 172800000).toISOString();
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          scheduledFor: newDate,
          purpose: 'Updated Rescheduled Purpose',
        })
        .expect(200);

      expect(res.body.data.purpose).toBe('Updated Rescheduled Purpose');
    });

    it('4. Start Inspection (POST /api/v1/inspections/:id/start)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/start`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .expect(200);

      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.startedAt).toBeDefined();
    });

    it('5. Disallow restarting an in-progress inspection (POST /api/v1/inspections/:id/start)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/start`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('6. Record 2 Observations atomically (POST /api/v1/inspections/:id/observations)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/observations`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send([
          {
            title: 'Critical Roof Strata Convergence Exceeding Tolerance',
            description: 'Tell-tale reading 22mm vs 10mm statutory threshold',
            category: 'SAFETY',
            severity: 'CRITICAL',
            findingType: 'NON_COMPLIANCE',
            complianceRequirementId: testRequirementId,
            complianceRecordId: testRecordId,
            isViolationCandidate: true,
          },
          {
            title: 'Secondary Ventilation Nominal',
            description: 'Airflow velocity measured 1.2 m/s',
            category: 'SAFETY',
            severity: 'LOW',
            findingType: 'NOTE',
            isViolationCandidate: false,
          },
        ])
        .expect(201);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].sequenceNumber).toBe(1);
      expect(res.body.data[1].sequenceNumber).toBe(2);

      observation1Id = res.body.data[0].id;
      observation2Id = res.body.data[1].id;
    });

    it('7. Formally Raise Violation from Observation 1 (POST /api/v1/observations/:id/violation)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/observations/${observation1Id}/violation`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          title: 'Statutory SCAMP Violation — Seam 12 Roof Convergence',
          markComplianceRecordNonCompliant: true,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.severity).toBe('CRITICAL');
      expect(res.body.data.mineId).toBe(testMineId);
      violationId = res.body.data.id;

      // Verify compliance record was atomically updated to NON_COMPLIANT
      expect(res.body.complianceRecordUpdated).toBeDefined();
      expect(res.body.complianceRecordUpdated.status).toBe('NON_COMPLIANT');

      const updatedRecord = await prisma.complianceRecord.findUnique({
        where: { id: testRecordId },
      });
      expect(updatedRecord?.status).toBe('NON_COMPLIANT');
    });

    it('8. Reject Duplicate Violation on Same Observation (409 Conflict)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/observations/${observation1Id}/violation`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          title: 'Duplicate Attempt',
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('9. Create and Assign Corrective Action (POST /api/v1/violations/:id/corrective-actions)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/violations/${violationId}/corrective-actions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Install 6 additional hydraulic support props',
          description: 'Deploy props across junction and re-survey convergence',
          assignedToId: mineOfficialUserId,
          dueAt: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.assignedToId).toBe(mineOfficialUserId);
      capaId = res.body.data.id;
    });

    it('10. Reject Assigning CAPA to user without mine scope (400 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/violations/${violationId}/corrective-actions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Assign to out-of-scope user',
          description: 'Should fail',
          assignedToId: unauthOfficialUserId,
          dueAt: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('11. Start CAPA (POST /api/v1/corrective-actions/:id/start)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/corrective-actions/${capaId}/start`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .expect(200);

      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.startedAt).toBeDefined();
    });

    it('12. Forbid Resolving Violation while CAPA is OPEN/IN_PROGRESS', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/violations/${violationId}`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          status: 'RESOLVED',
          resolutionNote: 'Trying to resolve prematurely',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('13. Close CAPA (POST /api/v1/corrective-actions/:id/close)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/corrective-actions/${capaId}/close`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          closureNote: 'All 6 hydraulic props installed. Convergence stabilized at 5mm.',
        })
        .expect(200);

      expect(res.body.data.status).toBe('CLOSED');
      expect(res.body.data.closedAt).toBeDefined();
      expect(res.body.allCorrectiveActionsClosed).toBe(true);
    });

    it('14. Resolve Violation after all CAPAs are closed (PATCH /api/v1/violations/:id)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/violations/${violationId}`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          status: 'RESOLVED',
          resolutionNote: 'Convergence verified within safe limits; certified by Area Safety Officer.',
        })
        .expect(200);

      expect(res.body.data.status).toBe('RESOLVED');
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    it('15. Complete Inspection (POST /api/v1/inspections/:id/complete)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/inspections/${inspectionId}/complete`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          summary: 'Shift inspection completed with full remediation of strata drift.',
        })
        .expect(200);

      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.summary.totalObservations).toBe(2);
      expect(res.body.summary.violationsRaised).toBe(1);
    });

    it('16. Forbid mutating observations after inspection is COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/observations/${observation2Id}`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          title: 'Illicit post-completion edit',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('17. Forbid rescheduling a completed inspection', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${mineOfficialToken}`)
        .send({
          scheduledFor: new Date().toISOString(),
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
