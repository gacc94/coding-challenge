import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type Request, type Response } from 'express';
import { StatsController } from '../../../src/controllers/stats.controller';
import type { StatsService } from '../../../src/services/stats.service';
import type { StatsResponse } from '../../../src/types/matrix.types';

function mockReq(body: unknown): Request {
  return { body } as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('StatsController', () => {
  let controller: StatsController;
  let mockService: StatsService;

  const mockStats: StatsResponse = {
    max: 8,
    min: 1,
    average: 4.5,
    sum: 36,
    totalElements: 8,
    numberOfMatrices: 2,
    diagonalMatrices: { count: 0, matrices: [] },
  };

  beforeEach(() => {
    mockService = {
      calculateStats: vi.fn().mockReturnValue(mockStats),
    } as unknown as StatsService;

    controller = new StatsController(mockService);
  });

  it('returns 200 with stats for valid request', () => {
    const req = mockReq({
      matrices: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
    });
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.json).toHaveBeenCalledWith(mockStats);
    expect(mockService.calculateStats).toHaveBeenCalled();
  });

  it('returns 400 for invalid schema', () => {
    const req = mockReq({ matrices: [] });
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('returns 400 for matrix with inconsistent rows', () => {
    const req = mockReq({
      matrices: [[[1, 2], [3]]],
    });
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('returns 400 for missing body', () => {
    const req = mockReq({});
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for non-numeric values', () => {
    const req = mockReq({
      matrices: [[['foo', 2], [3, 4]]],
    });
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('returns 500 when service throws', () => {
    mockService.calculateStats = vi.fn().mockImplementation(() => {
      throw new Error('Service error');
    });

    const req = mockReq({
      matrices: [[[1, 2], [3, 4]]],
    });
    const res = mockRes();

    controller.calculate(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'STATS_CALCULATION_ERROR' }),
    );
  });
});
