import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('OCR Digitization & Practical GIS (Phase 10)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

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
  let complianceRecordId: string;

  let attachmentValidId: string;
  let attachmentCorruptId: string;
  let ocrJobId: string;

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

    // 1. Create Companies
    const compA = await prisma.company.upsert({
      where: { code: 'OCR_CO_A' },
      update: {},
      create: { name: 'OCR Test Company A', code: 'OCR_CO_A', type: 'SUBSIDIARY' },
    });
    companyAId = compA.id;

    const compB = await prisma.company.upsert({
      where: { code: 'OCR_CO_B' },
      update: {},
      create: { name: 'OCR Test Company B', code: 'OCR_CO_B', type: 'SUBSIDIARY' },
    });
    companyBId = compB.id;

    // 2. Create Mine with Polygon GeoBoundary (Dhanbad region box [86.41, 23.74] to [86.43, 23.76])
    const jhariaBoundary = {
      type: 'Polygon',
      coordinates: [
        [
          [86.4100, 23.7400],
          [86.4300, 23.7400],
          [86.4300, 23.7600],
          [86.4100, 23.7600],
          [86.4100, 23.7400],
        ],
      ],
    };

    const mA1 = await prisma.mine.upsert({
      where: { code: 'OCR_MINE_A1' },
      update: { geoBoundary: jhariaBoundary as any },
      create: {
        name: 'OCR Mine A1 (Jharia Block)',
        code: 'OCR_MINE_A1',
        location: 'Dhanbad, Jharkhand',
        companyId: companyAId,
        geoBoundary: jhariaBoundary as any,
      },
    });
    mineA1Id = mA1.id;

    // 3. Create Compliance Requirement and Record
    const req = await prisma.complianceRequirement.create({
      data: {
        title: 'Quarterly OHS Form IV-B Return Test',
        category: 'SAFETY',
        frequency: 'QUARTERLY',
        description: 'Quarterly return under Mines Act 1952',
      },
    });

    const cRec = await prisma.complianceRecord.create({
      data: {
        mineId: mineA1Id,
        requirementId: req.id,
        status: 'COMPLIANT',
        nextDueAt: new Date('2026-09-30'),
      },
    });
    complianceRecordId = cRec.id;

    // 4. Create Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin-ocr@coalmine.gov.in' },
      update: { passwordHash },
      create: { name: 'Admin OCR', email: 'admin-ocr@coalmine.gov.in', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    });
    adminUserId = admin.id;

    const corpA = await prisma.user.upsert({
      where: { email: 'corp-a-ocr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Corp A OCR', email: 'corp-a-ocr@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyAId, status: 'ACTIVE' },
    });
    corporateUserIdA = corpA.id;

    await prisma.user.upsert({
      where: { email: 'corp-b-ocr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyBId },
      create: { name: 'Corp B OCR', email: 'corp-b-ocr@coalindia.gov.in', passwordHash, role: 'CORPORATE', companyId: companyBId, status: 'ACTIVE' },
    });

    const official = await prisma.user.upsert({
      where: { email: 'official-ocr@coalindia.gov.in' },
      update: { passwordHash, companyId: companyAId },
      create: { name: 'Official OCR', email: 'official-ocr@coalindia.gov.in', passwordHash, role: 'MINE_OFFICIAL', companyId: companyAId, status: 'ACTIVE' },
    });
    officialUserId = official.id;

    await prisma.userMineAssignment.upsert({
      where: { userId_mineId: { userId: officialUserId, mineId: mineA1Id } },
      update: { active: true },
      create: { userId: officialUserId, mineId: mineA1Id, active: true, assignedById: adminUserId },
    });

    // 5. Create Attachment Fixtures
    const att1 = await prisma.attachment.create({
      data: {
        fileName: 'dgms-form-iv-b-q2-2026.pdf',
        fileSize: 245000,
        mimeType: 'application/pdf',
        fileHash: 'sha256-demo-valid-hash-1234567890abcdef',
        storageKey: 'attachments/2026/08/dgms-form-iv-b-q2-2026.pdf',
        uploadedById: officialUserId,
        companyId: companyAId,
        mineId: mineA1Id,
      },
    });
    attachmentValidId = att1.id;

    const att2 = await prisma.attachment.create({
      data: {
        fileName: 'corrupt-document-scan.pdf',
        fileSize: 12000,
        mimeType: 'application/pdf',
        fileHash: 'sha256-demo-corrupt-hash-0987654321fedcba',
        storageKey: 'attachments/2026/08/corrupt-document-scan.pdf',
        uploadedById: officialUserId,
        companyId: companyAId,
        mineId: mineA1Id,
      },
    });
    attachmentCorruptId = att2.id;

    // Login
    const l1 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin-ocr@coalmine.gov.in', password: 'Test@1234' });
    adminToken = l1.body.data.accessToken;

    const l2 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-a-ocr@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenA = l2.body.data.accessToken;

    const l3 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'corp-b-ocr@coalindia.gov.in', password: 'Test@1234' });
    corporateTokenB = l3.body.data.accessToken;

    const l4 = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'official-ocr@coalindia.gov.in', password: 'Test@1234' });
    officialToken = l4.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.ocrExtraction.deleteMany({
        where: { job: { attachment: { companyId: { in: [companyAId, companyBId] } } } },
      });
      await prisma.ocrJob.deleteMany({
        where: { attachment: { companyId: { in: [companyAId, companyBId] } } },
      });
      await prisma.attachment.deleteMany({
        where: { companyId: { in: [companyAId, companyBId] } },
      });
      await prisma.complianceRecord.deleteMany({
        where: { mineId: mineA1Id },
      });
      await prisma.complianceRequirement.deleteMany({
        where: { title: 'Quarterly OHS Form IV-B Return Test' },
      });
      await prisma.userMineAssignment.deleteMany({
        where: { userId: officialUserId },
      });
      await prisma.mine.deleteMany({
        where: { id: mineA1Id },
      });
      for (const email of [
        'admin-ocr@coalmine.gov.in',
        'corp-a-ocr@coalindia.gov.in',
        'corp-b-ocr@coalindia.gov.in',
        'official-ocr@coalindia.gov.in',
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

  describe('1. GIS Spatial Engine (/mines/nearby & /mines/:id/location-context)', () => {
    it('Find nearby mines within 50km radius', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/mines/nearby?latitude=23.75&longitude=86.42&radiusKm=50')
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      const jharia = res.body.data.find((m: any) => m.id === mineA1Id);
      expect(jharia).toBeDefined();
      expect(jharia.distanceKm).toBeLessThan(10); // Very close to 23.75, 86.42
    });

    it('Point INSIDE mine polygon boundary (insideBoundary = true)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/mines/${mineA1Id}/location-context?latitude=23.750&longitude=86.420`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.insideBoundary).toBe(true);
      expect(res.body.data.distanceKm).toBeDefined();
      expect(res.body.data.limitations.toLowerCase()).toContain('ray-casting');
    });

    it('Point OUTSIDE mine polygon boundary (insideBoundary = false)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/mines/${mineA1Id}/location-context?latitude=23.850&longitude=86.550`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.insideBoundary).toBe(false);
      expect(res.body.data.distanceKm).toBeGreaterThan(10);
    });

    it('Reject coordinate out of range (400 BAD REQUEST)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/mines/nearby?latitude=123.75&longitude=86.42')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('Reject cross-company mine location context access (403 FORBIDDEN)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/mines/${mineA1Id}/location-context?latitude=23.75&longitude=86.42`)
        .set('Authorization', `Bearer ${corporateTokenB}`)
        .expect(403);
    });
  });

  describe('2. OCR Document Digitization Pipeline (/ocr/jobs)', () => {
    it('Trigger OCR job for compliance document (202 ACCEPTED)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ocr/jobs')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          attachmentId: attachmentValidId,
          targetType: 'COMPLIANCE_RECORD',
          targetId: complianceRecordId,
          languageHints: ['eng', 'hin'],
        })
        .expect(202);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.engineName).toBe('mock-ocr-v1');
      expect(res.body.data.extraction).toBeDefined();
      expect(res.body.data.extraction.fields.formType.value).toBe('Form IV-B');
      expect(res.body.data.extraction.fields.reportingPeriod.value).toBe('Q2-2026');
      expect(res.body.data.extraction.confidence).toBeGreaterThanOrEqual(0.9);

      ocrJobId = res.body.data.id;
    });

    it('Deduplication: Identical attachment reuses completed extraction', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ocr/jobs')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          attachmentId: attachmentValidId,
        })
        .expect(202);

      expect(res.body.data.id).toBe(ocrJobId);
      expect(res.body.data.deduplicated).toBe(true);
    });

    it('Get extraction details (/ocr/jobs/:id/extraction)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/ocr/jobs/${ocrJobId}/extraction`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(200);

      expect(res.body.data.extraction.fields.formType.value).toBe('Form IV-B');
      expect(res.body.data.disclaimer).toContain('Human review');
    });

    it('Human review & correction flow (/ocr/jobs/:id/review)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/ocr/jobs/${ocrJobId}/review`)
        .set('Authorization', `Bearer ${corporateTokenA}`)
        .send({
          correctedFields: {
            formType: 'Form IV-B',
            reportingPeriod: 'Q2-2026',
            averageDailyEmployment: 1420,
            fatalAccidents: 0,
            seriousInjuries: 1,
            officerConfirmedDate: '2026-08-25',
          },
          linkTarget: {
            type: 'COMPLIANCE_RECORD',
            id: complianceRecordId,
          },
        })
        .expect(201);

      expect(res.body.data.reviewed).toBe(true);
      expect(res.body.data.extraction.isLinked).toBe(true);
      expect(res.body.data.extraction.reviewedById).toBe(corporateUserIdA);
      expect(res.body.data.extraction.correctedFields.officerConfirmedDate).toBe('2026-08-25');

      // Crucial: Verify original ComplianceRecord status was NOT modified automatically
      const origRecord = await prisma.complianceRecord.findUnique({
        where: { id: complianceRecordId },
      });
      expect(origRecord?.status).toBe('COMPLIANT');
    });

    it('Corrupted attachment triggers sanitized FAILED status', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ocr/jobs')
        .set('Authorization', `Bearer ${officialToken}`)
        .send({
          attachmentId: attachmentCorruptId,
        })
        .expect(202);

      expect(res.body.data.status).toBe('FAILED');
      expect(res.body.data.errorCode).toBe('OCR_PROCESSING_ERROR');
      expect(res.body.data.errorMessage).toContain('OCR_CORRUPTED_DOCUMENT');
    });

    it('Retry failed job (/ocr/jobs/:id/retry)', async () => {
      const failedJob = await prisma.ocrJob.findFirst({
        where: { attachmentId: attachmentCorruptId, status: 'FAILED' },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/ocr/jobs/${failedJob!.id}/retry`)
        .set('Authorization', `Bearer ${officialToken}`)
        .expect(201);

      expect(res.body.data.status).toBe('FAILED'); // Still fails because mock adapter identifies corrupt name
    });
  });
});
