import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Worker Attendance (Phase 5)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let corporateTokenA: string;
  let corporateTokenB: string;
  let officialToken: string;

  let adminUserId: string;
  let officialUserId: string;

  let companyAId: string;
  let companyBId: string;
  let mineA1Id: string;
  let mineB1Id: string;

  let contractorAId: string;
  let activeContractA1Id: string;
  let expiredContractA1Id: string;

  let contractorWorker1Id: string; // Active assigned worker
  let contractorWorker2Id: string; // Worker on expired contract
  let employeeWorkerId: string;

  let unifiedWorker1Id: string;
  let unifiedWorker2Id: string;
  let openShiftId: string;

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
      where: { code: 'ATT_CO_A' },
      update: {},
      create: { name: 'Attendance Test Company A', code: 'ATT_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'ATT_CO_B' },
      update: {},
      create: { name: 'Attendance Test Company B', code: 'ATT_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const mA1 = await prisma.mine.upsert({
      where: { code: 'ATT_MINE_A1' },
      update: {},
      create: { name: 'Attendance Mine A1 (Dhanbad)', code: 'ATT_MINE_A1', location: 'Dhanbad', companyId: companyAId },
    });
    mineA1Id = mA1.id;

    const mB1 = await prisma.mine.upsert({
      where: { code: 'ATT_MINE_B1' },
      update: {},
      create: { name: 'Attendance Mine B1 (Asansol)', code: 'ATT_MINE_B1', location: 'WB', companyId: companyBId },
    });
    mineB1Id = mB1.id;

    // 2. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-att@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Att', email: 'admin-att@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-att@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A Att', email: 'corp-a-att@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });

    const corpB = await prisma.user.upsert({
      where: { email: 'corp-b-att@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B Att', email: 'corp-b-att@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-att@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Att', email: 'official-att@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // 3. Create Contractor & Contracts
    const contrA = await prisma.contractor.upsert({
      where: { companyId_registrationNumber: { companyId: companyAId, registrationNumber: 'CIN-ATT-001' } },
      update: {},
      create: {
        companyId: companyAId,
        legalName: 'Apex Mining Services Pvt Ltd',
        registrationNumber: 'CIN-ATT-001',
        status: 'ACTIVE',
      },
    });
    contractorAId = contrA.id;

    const actContract = await prisma.contractorContract.upsert({
      where: { companyId_contractNumber: { companyId: companyAId, contractNumber: 'CNT-ATT-ACT-001' } },
      update: {},
      create: {
        contractorId: contractorAId,
        companyId: companyAId,
        mineId: mineA1Id,
        contractNumber: 'CNT-ATT-ACT-001',
        title: 'Active Excavation Contract',
        startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
        status: 'ACTIVE',
        createdById: adminUserId,
      },
    });
    activeContractA1Id = actContract.id;

    const expContract = await prisma.contractorContract.upsert({
      where: { companyId_contractNumber: { companyId: companyAId, contractNumber: 'CNT-ATT-EXP-001' } },
      update: {},
      create: {
        contractorId: contractorAId,
        companyId: companyAId,
        mineId: mineA1Id,
        contractNumber: 'CNT-ATT-EXP-001',
        title: 'Expired Survey Contract',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        status: 'EXPIRED',
        createdById: adminUserId,
      },
    });
    expiredContractA1Id = expContract.id;

    // 4. Create Contractor Workers & Unified Worker Profiles
    const cw1 = await prisma.contractorWorker.upsert({
      where: { contractorId_employeeCode: { contractorId: contractorAId, employeeCode: 'APX-WRK-001' } },
      update: {},
      create: {
        contractorId: contractorAId,
        employeeCode: 'APX-WRK-001',
        fullName: 'Babu Lal Marandi',
        governmentIdMasked: 'XXXX-XXXX-9901',
        status: 'ACTIVE',
      },
    });
    contractorWorker1Id = cw1.id;

    // Assign cw1 to active contract
    await prisma.contractorWorkerAssignment.upsert({
      where: { workerId_contractId_mineId: { workerId: contractorWorker1Id, contractId: activeContractA1Id, mineId: mineA1Id } },
      update: { status: 'ACTIVE' },
      create: { workerId: contractorWorker1Id, contractId: activeContractA1Id, mineId: mineA1Id, status: 'ACTIVE' },
    });

    const w1 = await prisma.worker.upsert({
      where: { contractorWorkerId: contractorWorker1Id },
      update: {},
      create: {
        companyId: companyAId,
        employmentType: 'CONTRACTOR',
        displayName: 'Babu Lal Marandi',
        employeeCode: 'APX-WRK-001',
        contractorWorkerId: contractorWorker1Id,
        status: 'ACTIVE',
      },
    });
    unifiedWorker1Id = w1.id;

    const cw2 = await prisma.contractorWorker.upsert({
      where: { contractorId_employeeCode: { contractorId: contractorAId, employeeCode: 'APX-WRK-002' } },
      update: {},
      create: {
        contractorId: contractorAId,
        employeeCode: 'APX-WRK-002',
        fullName: 'Kishan Hansda',
        status: 'ACTIVE',
      },
    });
    contractorWorker2Id = cw2.id;

    // Assign cw2 ONLY to expired contract
    await prisma.contractorWorkerAssignment.upsert({
      where: { workerId_contractId_mineId: { workerId: contractorWorker2Id, contractId: expiredContractA1Id, mineId: mineA1Id } },
      update: { status: 'ACTIVE' },
      create: { workerId: contractorWorker2Id, contractId: expiredContractA1Id, mineId: mineA1Id, status: 'ACTIVE' },
    });

    const w2 = await prisma.worker.upsert({
      where: { contractorWorkerId: contractorWorker2Id },
      update: {},
      create: {
        companyId: companyAId,
        employmentType: 'CONTRACTOR',
        displayName: 'Kishan Hansda',
        employeeCode: 'APX-WRK-002',
        contractorWorkerId: contractorWorker2Id,
        status: 'ACTIVE',
      },
    });
    unifiedWorker2Id = w2.id;

    // 5. Create Internal Employee Worker
    const empW = await prisma.worker.upsert({
      where: { companyId_employeeCode: { companyId: companyAId, employeeCode: 'EMP-BCCL-001' } },
      update: {},
      create: {
        companyId: companyAId,
        employmentType: 'EMPLOYEE',
        displayName: 'Aakash Sharma',
        employeeCode: 'EMP-BCCL-001',
        status: 'ACTIVE',
      },
    });
    employeeWorkerId = empW.id;

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-att@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-att@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenA = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-att@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenB = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-att@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l4.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.attendanceRecord.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.worker.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.contractorWorkerAssignment.deleteMany({
        where: { mineId: { in: [mineA1Id, mineB1Id] } },
      });
      await prisma.contractorWorker.deleteMany({
        where: { contractor: { companyId: { in: [companyAId, companyBId] } } },
      });
      await prisma.contractorContract.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.contractor.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.mine.deleteMany({
        where: { id: { in: [mineA1Id, mineB1Id] } },
      });
      for (const email of [
        'admin-att@coalmine.gov.in',
        'corp-a-att@coalindia.gov.in',
        'corp-b-att@coalindia.gov.in',
        'official-att@coalindia.gov.in',
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

  describe('1. Shift Check-In Validations (/attendance/check-in)', () => {
    it('Reject check-in with invalid coordinates (400 BAD REQUEST)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          workerId: unifiedWorker1Id,
          mineId: mineA1Id,
          latitude: 95.0, // Invalid > 90
          longitude: 85.0,
        })
        .expect(400);
    });

    it('Reject contractor worker without active contract/assignment (422 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          workerId: unifiedWorker2Id, // Assigned only to expired contract
          mineId: mineA1Id,
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Successfully check in eligible contractor worker at Mine A1', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          workerId: unifiedWorker1Id,
          mineId: mineA1Id,
          latitude: 23.7957,
          longitude: 86.4304,
          method: 'MOBILE',
          note: 'Shift A Entry Check',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.workerId).toBe(unifiedWorker1Id);
      expect(res.body.data.mineId).toBe(mineA1Id);
      expect(res.body.data.isOpen).toBe(true);
      expect(res.body.data.checkInMethod).toBe('MOBILE');
      expect(res.body.data.businessDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      openShiftId = res.body.data.id;
    });

    it('Reject concurrent / duplicate check-in for the same worker (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          workerId: unifiedWorker1Id, // Already checked in
          mineId: mineA1Id,
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Successfully check in internal employee worker', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          workerId: employeeWorkerId,
          mineId: mineA1Id,
          method: 'KIOSK',
        })
        .expect(201);

      expect(res.body.data.workerId).toBe(employeeWorkerId);
      expect(res.body.data.isOpen).toBe(true);
    });
  });

  describe('2. Shift Check-Out Validations (/attendance/:id/check-out)', () => {
    it('Reject check-out with earlier timestamp than check-in (422 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/attendance/${openShiftId}/check-out`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Successfully check out the open shift', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/attendance/${openShiftId}/check-out`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          latitude: 23.796,
          longitude: 86.431,
          method: 'MOBILE',
          note: 'Shift A Completed Cleanly',
        })
        .expect(201);

      expect(res.body.data.id).toBe(openShiftId);
      expect(res.body.data.isOpen).toBe(false);
      expect(res.body.data.checkOutAt).toBeDefined();
    });

    it('Reject double check-out on already closed shift (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/attendance/${openShiftId}/check-out`)
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ note: 'Duplicate check out' })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('3. Attendance Queries & Summary Aggregation (/attendance/summary)', () => {
    it('Retrieve scoped attendance summary at Mine A1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/attendance/summary?mineId=${mineA1Id}`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.totalCheckedIn).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalCheckedOut).toBeGreaterThanOrEqual(1);
      expect(res.body.data.currentlyOnSite).toBeGreaterThanOrEqual(1); // employee worker still open
      expect(res.body.data.byEmploymentType.EMPLOYEE.currentlyOnSite).toBe(1);
      expect(res.body.data.byEmploymentType.CONTRACTOR.totalCheckedIn).toBe(1);
      expect(res.body.data.metricDefinitions).toBeDefined();
    });

    it('Corporate User B cannot view Company A attendance records (scoped isolation)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/attendance?mineId=${mineA1Id}`)
        .set('Authorization', `Bearer ${corporateTokenB}`)
        .expect(200);

      // Scoped down to empty
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('4. Unified Worker Profiles (/workers)', () => {
    it('Corporate User A creates a new internal employee worker profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workers')
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          displayName: 'Priya Mukherjee',
          employeeCode: 'EMP-BCCL-002',
          phone: '+91 9432109876',
          employmentType: 'EMPLOYEE',
        })
        .expect(201);

      expect(res.body.data.displayName).toBe('Priya Mukherjee');
      expect(res.body.data.companyId).toBe(companyAId);
    });

    it('Retrieve worker details with attendance records history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/workers/${unifiedWorker1Id}`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(unifiedWorker1Id);
      expect(res.body.data.displayName).toBe('Babu Lal Marandi');
      expect(res.body.data.attendanceRecords).toBeDefined();
      expect(res.body.data.attendanceRecords.length).toBeGreaterThanOrEqual(1);
    });
  });
});
