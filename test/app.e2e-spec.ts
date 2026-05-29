import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET) should return ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('Authentication', () => {
    const testPhone = `09${String(Date.now()).slice(-9)}`;
    let accessToken: string;

    it('/api/v1/auth/send-otp (POST) should accept phone number', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phoneNumber: testPhone })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('/api/v1/auth/verify-otp (POST) should authenticate with mock OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: testPhone, otp: '12345' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.phoneNumber).toBe(testPhone);
          accessToken = res.body.accessToken;
        });
    });

    it('/api/v1/auth/me (GET) should return user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.phoneNumber).toBe(testPhone);
        });
    });

    it('/api/v1/auth/me (GET) should return 401 without token', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('Products', () => {
    it('/api/v1/products (GET) should return products list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Categories', () => {
    it('/api/v1/categories (GET) should return categories list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
