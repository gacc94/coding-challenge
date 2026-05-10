import { describe, it, expect, beforeEach } from 'vitest';
import { EnvConfig } from '../../../src/config/env';

describe('EnvConfig', () => {
  beforeEach(() => {
    delete process.env.PORT;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRATION;
    delete process.env.AUTH_USERNAME;
    delete process.env.AUTH_PASSWORD;
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGIN;
  });

  it('uses default values when no env vars set', () => {
    const config = new EnvConfig();

    expect(config.PORT).toBe(3002);
    expect(config.JWT_SECRET).toBe('default-secret-change-in-production');
    expect(config.JWT_EXPIRATION).toBe(3600);
    expect(config.AUTH_USERNAME).toBe('admin');
    expect(config.AUTH_PASSWORD).toBe('secret');
    expect(config.NODE_ENV).toBe('development');
    expect(config.CORS_ORIGIN).toBe('*');
  });

  it('reads PORT from environment', () => {
    process.env.PORT = '4000';
    const config = new EnvConfig();
    expect(config.PORT).toBe(4000);
  });

  it('reads JWT_SECRET from environment', () => {
    process.env.JWT_SECRET = 'my-secret';
    const config = new EnvConfig();
    expect(config.JWT_SECRET).toBe('my-secret');
  });

  it('reads AUTH_USERNAME and AUTH_PASSWORD from environment', () => {
    process.env.AUTH_USERNAME = 'user1';
    process.env.AUTH_PASSWORD = 'pass1';
    const config = new EnvConfig();
    expect(config.AUTH_USERNAME).toBe('user1');
    expect(config.AUTH_PASSWORD).toBe('pass1');
  });

  it('reads NODE_ENV from environment', () => {
    process.env.NODE_ENV = 'test';
    const config = new EnvConfig();
    expect(config.NODE_ENV).toBe('test');
  });

  it('reads CORS_ORIGIN from environment', () => {
    process.env.CORS_ORIGIN = 'http://example.com';
    const config = new EnvConfig();
    expect(config.CORS_ORIGIN).toBe('http://example.com');
  });

  it('reads JWT_EXPIRATION as number', () => {
    process.env.JWT_EXPIRATION = '7200';
    const config = new EnvConfig();
    expect(config.JWT_EXPIRATION).toBe(7200);
  });
});
