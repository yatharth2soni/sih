import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (Integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let prisma: PrismaService;

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

    // Seed a test user
    const passwordHash = await bcrypt.hash('Test@1234', 10);
    await prisma.user.upsert({
      where: { email: 'test-auth@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Test Auth User',
        email: 'test-auth@coalmine.gov.in',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  }, 30000);

  afterAll(async () => {
    // Cleanup test user and their refresh tokens
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: 'test-auth@coalmine.gov.in' },
      });
      if (user) {
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return tokens and user on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test-auth@coalmine.gov.in');
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should return 401 on wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'WrongPass' })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 on non-existent email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'noone@nowhere.com', password: 'Test@1234' })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 on missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'Test@1234' })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new tokens on valid refresh', async () => {
      // First login to get a refresh token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const refreshToken = loginRes.body.data.refreshToken;

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
      // New refresh token should be different (rotation)
      expect(refreshRes.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should reject a reused (revoked) refresh token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const refreshToken = loginRes.body.data.refreshToken;

      // Use it once (valid)
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Use it again (should be revoked)
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 on valid logout', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body.data;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.data.message).toBe('Logged out successfully');
    });

    it('should return 401 on logout without access token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'anything' })
        .expect(401);
    });
  });
});
