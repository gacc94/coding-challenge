import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type Request, type Response } from 'express';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth.service';
import type { EnvConfig } from '../../../src/config/env';

function mockReq(body: unknown): Request {
  return { body } as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockConfig: EnvConfig = {
    PORT: 3002,
    JWT_SECRET: 'test-secret',
    JWT_EXPIRATION: 3600,
    AUTH_USERNAME: 'admin',
    AUTH_PASSWORD: 'secret',
    NODE_ENV: 'test',
    CORS_ORIGIN: '*',
  } as EnvConfig;

  beforeEach(() => {
    authService = new AuthService(mockConfig);
    controller = new AuthController(authService);
  });

  it('returns 200 with token for valid credentials', () => {
    const req = mockReq({ username: 'admin', password: 'secret' });
    const res = mockRes();

    controller.login(req, res);

    expect(res.json).toHaveBeenCalled();
    const callArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.token).toBeDefined();
    expect(callArg.type).toBe('Bearer');
    expect(callArg.expiresIn).toBe(3600);
  });

  it('returns 401 for invalid credentials', () => {
    const req = mockReq({ username: 'admin', password: 'wrongpassword' });
    const res = mockRes();

    controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_INVALID_CREDENTIALS' }),
    );
  });

  it('returns 400 for empty username', () => {
    const req = mockReq({ username: '', password: 'secret123' });
    const res = mockRes();

    controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('returns 400 for short password', () => {
    const req = mockReq({ username: 'admin', password: '12345' });
    const res = mockRes();

    controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('re-throws non-AuthError exceptions', () => {
    const badService = {
      login: () => { throw new Error('Unexpected error'); },
    } as unknown as AuthService;
    const badController = new AuthController(badService);

    const req = mockReq({ username: 'admin', password: 'secret' });
    const res = mockRes();

    expect(() => badController.login(req, res)).toThrow('Unexpected error');
  });
});
