import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-integration';
  process.env.JWT_EXPIRATION = '3600';
  process.env.AUTH_USERNAME = 'admin';
  process.env.AUTH_PASSWORD = 'secret';
  process.env.NODE_ENV = 'test';
  process.env.CORS_ORIGIN = '*';
  process.env.PORT = '3002';
});
