import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Mines RBAC (Integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let regulatorToken: string;

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

    // Admin user
    await prisma.user.upsert({
      where: { email: 'test-admin-mines@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Test Admin',
        email: 'test-admin-mines@coalmine.gov.in',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Regulator user (non-admin)
    await prisma.user.upsert({
      where: { email: 'test-regulator-mines@dgms.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Test Regulator',
        email: 'test-regulator-mines@dgms.gov.in',
        passwordHash,
        role: 'REGULATOR',
        status: 'ACTIVE',
      },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test-admin-mines@coalmine.gov.in', password: 'Test@1234' });
    adminToken = adminLogin.body.data.accessToken;

    const regLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test-regulator-mines@dgms.gov.in', password: 'Test@1234' });
    regulatorToken = regLogin.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      for (const email of [
        'test-admin-mines@coalmine.gov.in',
        'test-regulator-mines@dgms.gov.in',
      ]) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
          await prisma.user.delete({ where: { id: user.id } });
        }
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/mines', () => {
    it('should return 200 for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/mines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });

    it('should return 403 for non-admin (regulator)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/mines')
        .set('Authorization', `Bearer ${regulatorToken}`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/mines')
        .expect(401);
    });
  });
});
