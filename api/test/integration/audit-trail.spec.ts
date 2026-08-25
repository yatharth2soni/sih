import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuditService } from '../../src/audit/audit.service';
import {
  canonicalizePayload,
  computePayloadHash,
  GENESIS_PREV_HASH,
} from '../../src/audit/canonicalizer';
import * as bcrypt from 'bcrypt';

describe('Hash-Chained Tamper-Evident Audit Trail (Stretch Phase)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;
  let auditService: AuditService;

  let adminToken: string;
  let corporateTokenA: string;
  let corporateTokenB: string;
  let officialToken: string;

  let adminUserId: string;
  let corporateUserIdA: string;
  let officialUserId: string;

  let companyAId: string;
  let companyBId: string;
  let mineA1Id: string;

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
    auditService = app.get(AuditService);
    const passwordHash = await bcrypt.hash('Test@1234', 10);

    // 1. Create Companies & Mine
    const compA = await prisma.company.upsert({
      where: { code: 'AUD_CO_A' },
      update: {},
      create: { name: 'Audit Test Company A', code: 'AUD_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'AUD_CO_B' },
      update: {},
      create: { name: 'Audit Test Company B', code: 'AUD_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    const mA1 = await prisma.mine.upsert({
      where: { code: 'AUD_MINE_A1' },
      update: {},
      create: { name: 'Audit Mine A1', code: 'AUD_MINE_A1', location: 'Dhanbad', companyId: companyAId },
    });
    mineA1Id = mA1.id;

    // 2. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-aud@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin Audit', email: 'admin-aud@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-aud@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A Audit', email: 'corp-a-aud@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });
    corporateUserIdA = corpA.id;

    await prisma.user.upsert({
      where: { email: 'corp-b-aud@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B Audit', email: 'corp-b-aud@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-aud@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official Audit', email: 'official-aud@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-aud@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-aud@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenA = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-aud@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenB = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-aud@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l4.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.auditLog.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.mine.deleteMany({
        where: { id: mineA1Id },
      });
      for (const email of [
        'admin-aud@coalmine.gov.in',
        'corp-a-aud@coalindia.gov.in',
        'corp-b-aud@coalindia.gov.in',
        'official-aud@coalindia.gov.in',
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

  describe('1. Canonical Serialization & Cryptographic Determinism', () => {
    it('Identical objects with unordered keys yield exact same canonical hash', () => {
      const obj1 = { z: 1, a: 'test', m: { b: true, a: false } };
      const obj2 = { a: 'test', m: { a: false, b: true }, z: 1 };

      const canon1 = canonicalizePayload(obj1);
      const canon2 = canonicalizePayload(obj2);

      expect(canon1).toBe(canon2);
      expect(computePayloadHash(canon1)).toBe(computePayloadHash(canon2));
    });

    it('Sensitive fields (password, tokens, secrets) are strictly stripped during canonicalization', () => {
      const payload = {
        action: 'USER_LOGIN',
        password: 'SuperSecretPassword',
        jwt: 'eyJhbGciOi...',
        refreshToken: 'opaque-refresh-token',
        validField: 'SafeData',
      };

      const canon = canonicalizePayload(payload);
      expect(canon).not.toContain('SuperSecretPassword');
      expect(canon).not.toContain('password');
      expect(canon).not.toContain('jwt');
      expect(canon).not.toContain('refreshToken');
      expect(canon).toContain('SafeData');
    });
  });

  describe('2. Dual-Layer Hash Chaining & Genesis Append', () => {
    let entry1: any;
    let entry2: any;
    let entry3: any;

    it('Append sequential audit entries with cryptographic chain links', async () => {
      entry1 = await auditService.appendEntry({
        action: 'COMPLIANCE_STATUS_UPDATED',
        entityType: 'ComplianceRecord',
        entityId: 'rec-test-01',
        actorId: officialUserId,
        companyId: companyAId,
        mineId: mineA1Id,
        beforeSummary: { status: 'PENDING' },
        afterSummary: { status: 'COMPLIANT' },
      });

      expect(entry1.sequence).toBeGreaterThanOrEqual(1);
      expect(entry1.payloadHash).toHaveLength(64);
      expect(entry1.hmacHash).toHaveLength(64);

      entry2 = await auditService.appendEntry({
        action: 'VIOLATION_RAISED',
        entityType: 'Violation',
        entityId: 'viol-test-02',
        actorId: officialUserId,
        companyId: companyAId,
        mineId: mineA1Id,
        afterSummary: { severity: 'HIGH', status: 'OPEN' },
      });

      expect(entry2.sequence).toBe(entry1.sequence + 1);
      expect(entry2.prevHash).toBe(entry1.hmacHash); // Chain link verified

      entry3 = await auditService.appendEntry({
        action: 'CAPA_CLOSED',
        entityType: 'CorrectiveAction',
        entityId: 'capa-test-03',
        actorId: corporateUserIdA,
        companyId: companyAId,
        mineId: mineA1Id,
        beforeSummary: { status: 'IN_PROGRESS' },
        afterSummary: { status: 'CLOSED', closureNote: 'Verified complete' },
      });

      expect(entry3.sequence).toBe(entry2.sequence + 1);
      expect(entry3.prevHash).toBe(entry2.hmacHash); // Chain link verified
    });

    it('Verify unbroken chain segment (GET /audit-logs/verify)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/audit-logs/verify?fromSequence=${entry1.sequence}&toSequence=${entry3.sequence}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.verifiedCount).toBe(3);
      expect(res.body.data.headSequence).toBe(entry3.sequence);
      expect(res.body.data.securityDisclosure).toContain('HMAC-SHA-256');
    });

    it('Detect direct DB row tampering (payload modification)', async () => {
      // Simulate raw database attacker tampering with row content without knowing server HMAC secret
      await prisma.auditLog.update({
        where: { id: entry2.id },
        data: { action: 'FORGED_TAMPERED_ACTION' },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/audit-logs/verify?fromSequence=${entry1.sequence}&toSequence=${entry3.sequence}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.firstMismatchSequence).toBe(entry2.sequence);
      expect(res.body.data.reason).toContain('Payload tampering detected');
    });
  });

  describe('3. Scope Filtering & Auditor Access (/audit-logs)', () => {
    it('Corporate User A views only Company A audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      res.body.data.forEach((log: any) => {
        expect(log.companyId).toBe(companyAId);
      });
    });

    it('Corporate User B cannot view Company A audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/audit-logs?companyId=${companyAId}`)
        .set('Authorization', `Bearer ${corporateTokenB}`)
        .expect(200);

      // Scoping automatically forces user companyId, resulting in zero Company A logs
      res.body.data.forEach((log: any) => {
        expect(log.companyId).toBe(companyBId);
      });
    });

    it('Admin views entity audit trail (GET /audit-logs/entity/:type/:id)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs/entity/ComplianceRecord/rec-test-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.entityType).toBe('ComplianceRecord');
      expect(res.body.data.entityId).toBe('rec-test-01');
      expect(res.body.data.totalEntries).toBeGreaterThanOrEqual(1);
    });
  });
});
