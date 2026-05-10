import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createJwtMiddleware } from '../../../src/middleware/jwt.middleware';

function mockReq(auth?: string): Request {
  return {
    headers: auth ? { authorization: auth } : {},
  } as unknown as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function mockNext(): NextFunction {
  return vi.fn();
}

describe('createJwtMiddleware', () => {
  const secret = 'test-secret-123';
  const middleware = createJwtMiddleware(secret);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next() for valid token', () => {
    const token = jwt.sign({ sub: 'admin' }, secret, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_MISSING_TOKEN' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for malformed authorization header', () => {
    const req = mockReq('Basic abc123');
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_INVALID_FORMAT' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid JWT signature', () => {
    const token = jwt.sign({ sub: 'hacker' }, 'different-secret', { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_INVALID_TOKEN' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for expired token', () => {
    const token = jwt.sign({ sub: 'admin' }, secret, { expiresIn: '0s' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_INVALID_TOKEN' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user on successful auth', () => {
    const token = jwt.sign({ sub: 'admin' }, secret, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe('admin');
  });
});
