import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service';
import { StatsService } from '../../../src/services/stats.service';
import { AuthController } from '../../../src/controllers/auth.controller';
import { StatsController } from '../../../src/controllers/stats.controller';
import { HealthController } from '../../../src/controllers/health.controller';
import { AuthRoutes } from '../../../src/routes/auth.routes';
import { StatsRoutes } from '../../../src/routes/stats.routes';
import { errorMiddleware } from '../../../src/middleware/error.middleware';
import type { EnvConfig } from '../../../src/config/env';

describe('Integration: API Endpoints', () => {
  const JWT_SECRET = 'test-secret-integration';
  const config = {
    PORT: 3002,
    JWT_SECRET,
    JWT_EXPIRATION: 3600,
    AUTH_USERNAME: 'admin',
    AUTH_PASSWORD: 'secret',
    NODE_ENV: 'test',
    CORS_ORIGIN: '*',
  } as EnvConfig;

  const app = express();
  let authToken: string;

  beforeAll(() => {
    app.use(cors());
    app.use(express.json());

    const statsService = new StatsService();
    const authService = new AuthService(config);

    const statsController = new StatsController(statsService);
    const authController = new AuthController(authService);
    const healthController = new HealthController(config);

    app.use(new StatsRoutes(statsController, JWT_SECRET).router);
    app.use(new AuthRoutes(authController).router);
    app.get('/health', healthController.check);
    app.use(errorMiddleware);
  });

  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('node-api');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns token with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'secret' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.type).toBe('Bearer');
      authToken = res.body.token;
    });

    it('returns 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/stats', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/stats')
        .send({ matrices: [[[1, 2], [3, 4]]] });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_MISSING_TOKEN');
    });

    it('returns 200 with stats for valid request', async () => {
      const res = await request(app)
        .post('/api/v1/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ matrices: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] });

      expect(res.status).toBe(200);
      expect(res.body.max).toBe(8);
      expect(res.body.min).toBe(1);
      expect(res.body.numberOfMatrices).toBe(2);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/stats')
        .set('Authorization', 'Bearer invalid-token')
        .send({ matrices: [[[1, 2]]] });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_TOKEN');
    });
  });
});
