import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Compliance (Integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

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

    // Create test user and login
    const passwordHash = await bcrypt.hash('Test@1234', 10);
    await prisma.user.upsert({
      where: { email: 'test-compliance@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Test Compliance User',
        email: 'test-compliance@coalmine.gov.in',
        passwordHash,
        role: 'MINE_OFFICIAL',
        status: 'ACTIVE',
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test-compliance@coalmine.gov.in', password: 'Test@1234' });

    accessToken = loginRes.body.data.accessToken;

    // Seed a requirement for testing
    const existingReq = await prisma.complianceRequirement.findFirst({
      where: { title: 'Test Safety Requirement' },
    });
    if (!existingReq) {
      await prisma.complianceRequirement.create({
        data: {
          title: 'Test Safety Requirement',
          category: 'SAFETY',
          frequency: 'Daily',
          description: 'Test requirement for integration tests',
          applicableTo: 'MINE',
        },
      });
    }
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: 'test-compliance@coalmine.gov.in' },
      });
      if (user) {
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
      // Clean up test requirement
      await prisma.complianceRequirement.deleteMany({
        where: { title: 'Test Safety Requirement' },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/compliance/requirements', () => {
    it('should return paginated requirements for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/compliance/requirements')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/compliance/requirements')
        .expect(401);
    });

    it('should filter by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/compliance/requirements?category=SAFETY')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      for (const req of res.body.data) {
        expect(req.category).toBe('SAFETY');
      }
    });
  });
});
