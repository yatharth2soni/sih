import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Contractor Management (Phase 4)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let regulatorToken: string;
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
  let activeContractId: string;
  let worker1Id: string;

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

    // 1. Create 2 Companies & 2 Mines
    const compA = await prisma.company.upsert({
      where: { code: 'CONTR_CO_A' },
      update: {},
      create: { name: 'Contractor Test Company A', code: 'CONTR_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'CONTR_CO_B' },
      update: {},
      create: { name: 'Contractor Test Company B', code: 'CONTR_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const mA1 = await prisma.mine.upsert({
      where: { code: 'CONTR_MINE_A1' },
      update: {},
      create: { name: 'Mine A1 (Dhanbad)', code: 'CONTR_MINE_A1', location: 'Dhanbad', companyId: companyAId },
    });
    mineA1Id = mA1.id;

    const mB1 = await prisma.mine.upsert({
      where: { code: 'CONTR_MINE_B1' },
      update: {},
      create: { name: 'Mine B1 (Asansol)', code: 'CONTR_MINE_B1', location: 'WB', companyId: companyBId },
    });
    mineB1Id = mB1.id;

    // 2. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-contr@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Contr', email: 'admin-contr@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const regulator = await prisma.user.upsert({
      where: { email: 'regulator-contr@dgms.gov.in' },
      update: { passwordHash },
      create: { name: 'Regulator Contr', email: 'regulator-contr@dgms.gov.in', passwordHash, role: 'REGULATOR', status: 'ACTIVE' },
    });

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-contr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A Contr', email: 'corp-a-contr@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });

    const corpB = await prisma.user.upsert({
      where: { email: 'corp-b-contr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B Contr', email: 'corp-b-contr@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-contr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Contr', email: 'official-contr@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    // Assign Official to Mine A1
    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-contr@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'regulator-contr@dgms.gov.in', password: 'Test@1234' });
    regulatorToken = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-contr@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenA = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-contr@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenB = l4.body.data.accessToken;

    const l5 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-contr@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l5.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
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
        'admin-contr@coalmine.gov.in',
        'regulator-contr@dgms.gov.in',
        'corp-a-contr@coalindia.gov.in',
        'corp-b-contr@coalindia.gov.in',
        'official-contr@coalindia.gov.in',
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

  describe('1. Contractor Registration & Scoping (/contractors)', () => {
    it('Corporate User A creates a new contractor for Company A', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contractors')
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          legalName: 'Deccan Mining Solutions Ltd',
          tradeName: 'Deccan Mining',
          registrationNumber: 'CIN-U10100MH2018PTC123456',
          contactName: 'Suresh Patil',
          email: 'suresh@deccanmining.com',
          phone: '+91 9876543210',
          address: { street: '12 Industrial Area', city: 'Nagpur', state: 'MH', postalCode: '440001' },
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.legalName).toBe('Deccan Mining Solutions Ltd');
      expect(res.body.data.companyId).toBe(companyAId);
      expect(res.body.data.status).toBe('ACTIVE');
      contractorAId = res.body.data.id;
    });

    it('Reject duplicate registrationNumber within same company (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contractors')
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          legalName: 'Deccan Duplicate Entry',
          registrationNumber: 'CIN-U10100MH2018PTC123456', // Same registration
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Forbid Mine Official from creating a contractor (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contractors')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({ legalName: 'Illegal Creation' })
        .expect(403);
    });

    it('Corporate User B cannot view Company A contractor (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/contractors/${contractorAId}`)
        .set('Authorization', `Bearer ${corporateTokenB}`)
        .expect(403);
    });
  });

  describe('2. Contractor Contracts Lifecycle (/contractors/:id/contracts)', () => {
    it('Reject contract with endDate < startDate (422 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/contracts`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          contractNumber: 'CNT-2026-INVALID',
          title: 'Invalid Date Range Contract',
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-01-01T00:00:00Z', // Before start
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Reject assigning Mine B1 (Company B) to Contractor A (Company A) (422 VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/contracts`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          contractNumber: 'CNT-2026-MISMATCH',
          title: 'Mismatched Mine Contract',
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-12-31T00:00:00Z',
          mineId: mineB1Id, // Foreign company mine
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Create valid time-bounded active contract at Mine A1', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/contracts`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          contractNumber: 'CNT-2026-HEMM-001',
          title: 'HEMM Overburden Removal Contract',
          startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          endDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
          mineId: mineA1Id,
          scopeOfWork: { machineryCount: 12, targetVolumeCuM: 500000 },
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.contractNumber).toBe('CNT-2026-HEMM-001');
      expect(res.body.data.status).toBe('ACTIVE');
      activeContractId = res.body.data.id;
    });

    it('Reject duplicate contractNumber within same company (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/contracts`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          contractNumber: 'CNT-2026-HEMM-001', // Duplicate
          title: 'Duplicate Number Contract',
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-12-31T00:00:00Z',
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Query contracts with asOf filter computes EXPIRED relative to date', async () => {
      // Create past contract
      const pastRes = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/contracts`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          contractNumber: 'CNT-PAST-001',
          title: 'Old 2024 Geological Survey',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T00:00:00Z',
          mineId: mineA1Id,
        });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/contractor-contracts?asOf=${new Date().toISOString()}`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .expect(200);

      const pastContract = res.body.data.find((c: any) => c.contractNumber === 'CNT-PAST-001');
      expect(pastContract).toBeDefined();
      expect(pastContract.effectiveStatus).toBe('EXPIRED');
    });
  });

  describe('3. Contractor Workers & Privacy-Preserving Identities', () => {
    it('Register contractor worker with privacy-preserving identity masking', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/workers`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          fullName: 'Ramesh Kumar Verma',
          employeeCode: 'DEC-WRK-001',
          phone: '+91 9123456789',
          governmentId: '9876-5432-4921', // Sensitive plaintext
          role: 'HEMM Excavator Operator',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.fullName).toBe('Ramesh Kumar Verma');
      expect(res.body.data.employeeCode).toBe('DEC-WRK-001');
      // Verify plaintext is masked
      expect(res.body.data.governmentIdMasked).toBe('XXXX-XXXX-4921');
      expect(res.body.data.governmentIdHash).toBeDefined();
      worker1Id = res.body.data.id;
    });

    it('Reject duplicate employeeCode per contractor (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractors/${contractorAId}/workers`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          fullName: 'Another Worker',
          employeeCode: 'DEC-WRK-001', // Duplicate code
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Assign worker to contract and mine site', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractor-contracts/${activeContractId}/workers/assign`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          workerId: worker1Id,
          mineId: mineA1Id,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.workerId).toBe(worker1Id);
      expect(res.body.data.status).toBe('ACTIVE');
    });
  });

  describe('4. Active Contractor Roster at Mine (/mines/:mineId/contractors)', () => {
    it('Mine Official views active contractor roster at assigned Mine A1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/mines/${mineA1Id}/contractors`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.mine.name).toBe('Mine A1 (Dhanbad)');
      expect(res.body.data.totalActiveContractors).toBeGreaterThanOrEqual(1);

      const rosterEntry = res.body.data.roster.find((r: any) => r.contractNumber === 'CNT-2026-HEMM-001');
      expect(rosterEntry).toBeDefined();
      expect(rosterEntry.contractor.legalName).toBe('Deccan Mining Solutions Ltd');
      expect(rosterEntry.activeWorkersCount).toBe(1);
      expect(rosterEntry.workers[0].fullName).toBe('Ramesh Kumar Verma');
      expect(rosterEntry.workers[0].governmentIdMasked).toBe('XXXX-XXXX-4921');
    });

    it('Forbid Mine Official from viewing unassigned Mine B1 roster (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/mines/${mineB1Id}/contractors`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(403);
    });
  });

  describe('5. Contract Termination Lifecycle', () => {
    it('Terminate contract with mandatory reason (transitions to TERMINATED)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractor-contracts/${activeContractId}/terminate`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({ reason: 'Project completed ahead of schedule' })
        .expect(201);

      expect(res.body.data.status).toBe('TERMINATED');
      expect(res.body.data.terminationReason).toBe('Project completed ahead of schedule');
    });

    it('Reject terminating an already terminated contract (409 CONFLICT)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/contractor-contracts/${activeContractId}/terminate`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({ reason: 'Duplicate termination' })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });
  });
});
