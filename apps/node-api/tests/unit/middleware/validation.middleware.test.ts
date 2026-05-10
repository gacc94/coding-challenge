import { type Request, type Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateSchema } from '../../../src/middleware/validation.middleware';

function mockReq(body: unknown): Request {
  return { body } as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('validateSchema middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  });

  it('calls next for valid data', () => {
    const middleware = validateSchema(schema);
    const req = mockReq({ name: 'John', age: 30 });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for invalid data', () => {
    const middleware = validateSchema(schema);
    const req = mockReq({ name: '', age: -5 });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('overwrites req.body with parsed data', () => {
    const middleware = validateSchema(schema);
    const req = mockReq({ name: 'Jane', age: 25 });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(req.body).toEqual({ name: 'Jane', age: 25 });
  });
});
