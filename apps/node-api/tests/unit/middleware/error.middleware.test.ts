import { describe, it, expect, vi } from 'vitest';
import { type Request, type Response, type NextFunction } from 'express';
import { errorMiddleware } from '../../../src/middleware/error.middleware';

function mockReq(): Request {
  return {} as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('errorMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 with error message', () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    const err = new Error('Test error');

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Test error',
        code: 'INTERNAL_ERROR',
        status: 500,
      }),
    );
  });

  it('uses default message if error has no message', () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    const err = new Error();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Internal server error' }),
    );
  });
});
