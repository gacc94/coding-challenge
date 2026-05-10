import { describe, it, expect } from 'vitest';
import { StatsService } from '../../../src/services/stats.service';

describe('StatsService', () => {
  const service = new StatsService();

  describe('calculateStats', () => {
    it('calculates stats for single matrix', () => {
      const result = service.calculateStats([[[1, 2], [3, 4]]]);
      expect(result.max).toBe(4);
      expect(result.min).toBe(1);
      expect(result.sum).toBe(10);
      expect(result.average).toBe(2.5);
      expect(result.totalElements).toBe(4);
      expect(result.numberOfMatrices).toBe(1);
    });

    it('calculates stats for multiple matrices', () => {
      const matrices = [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[-1, 0], [2, -3]]];
      const result = service.calculateStats(matrices);
      expect(result.max).toBe(8);
      expect(result.min).toBe(-3);
      expect(result.numberOfMatrices).toBe(3);
      expect(result.totalElements).toBe(12);
    });

    it('handles matrices with negative values', () => {
      const result = service.calculateStats([[[-5, -3], [-1, -2]]]);
      expect(result.max).toBe(-1);
      expect(result.min).toBe(-5);
      expect(result.sum).toBe(-11);
      expect(result.average).toBe(-2.75);
    });

    it('handles matrices with floating point values', () => {
      const result = service.calculateStats([[[0.169, 0.897], [0.507, 0.276]]]);
      expect(result.max).toBeCloseTo(0.897);
      expect(result.min).toBeCloseTo(0.169);
    });

    it('handles single row matrices', () => {
      const result = service.calculateStats([[[1, 2, 3, 4]]]);
      expect(result.max).toBe(4);
      expect(result.min).toBe(1);
      expect(result.totalElements).toBe(4);
    });

    it('handles single column matrices', () => {
      const result = service.calculateStats([[[1], [2], [3], [4]]]);
      expect(result.max).toBe(4);
      expect(result.min).toBe(1);
      expect(result.totalElements).toBe(4);
    });

    it('handles single element matrix', () => {
      const result = service.calculateStats([[[42]]]);
      expect(result.max).toBe(42);
      expect(result.min).toBe(42);
      expect(result.sum).toBe(42);
      expect(result.average).toBe(42);
      expect(result.totalElements).toBe(1);
    });

    it('handles zero matrices', () => {
      const result = service.calculateStats([[[0, 0], [0, 0]]]);
      expect(result.max).toBe(0);
      expect(result.min).toBe(0);
      expect(result.sum).toBe(0);
      expect(result.average).toBe(0);
      expect(result.diagonalMatrices.count).toBe(1);
    });

    it('handles rectangular matrix stats', () => {
      const result = service.calculateStats([[[1, 2, 3], [4, 5, 6]]]);
      expect(result.max).toBe(6);
      expect(result.min).toBe(1);
      expect(result.totalElements).toBe(6);
      expect(result.average).toBeCloseTo(3.5);
    });

    it('handles more than 3 matrices (name fallback)', () => {
      const matrices = [
        [[1, 2], [3, 4]],
        [[1, 0], [0, 2]],
        [[2, 0], [0, 3]],
        [[5, 0], [0, 6]],
      ];
      const result = service.calculateStats(matrices);
      expect(result.numberOfMatrices).toBe(4);
      expect(result.diagonalMatrices.count).toBe(3);
      expect(result.diagonalMatrices.matrices[2].name).toBe('Matrix 4');
    });
  });

  describe('diagonal matrix detection', () => {
    it('identifies diagonal matrix correctly', () => {
      const result = service.calculateStats([[[1, 0], [0, 4]]]);
      expect(result.diagonalMatrices.count).toBe(1);
      expect(result.diagonalMatrices.matrices[0].name).toBe('Q (Orthogonal)');
      expect(result.diagonalMatrices.matrices[0].dimensions).toBe('2x2');
    });

    it('identifies identity matrix as diagonal', () => {
      const result = service.calculateStats([[[1, 0, 0], [0, 1, 0], [0, 0, 1]]]);
      expect(result.diagonalMatrices.count).toBe(1);
      expect(result.diagonalMatrices.matrices[0].dimensions).toBe('3x3');
    });

    it('does not mark non-diagonal matrix as diagonal', () => {
      const result = service.calculateStats([[[1, 2], [3, 4]]]);
      expect(result.diagonalMatrices.count).toBe(0);
    });

    it('does not mark non-square matrix as diagonal', () => {
      const result = service.calculateStats([[[1, 2, 3], [4, 5, 6]]]);
      expect(result.diagonalMatrices.count).toBe(0);
    });

    it('identifies multiple diagonal matrices', () => {
      const result = service.calculateStats([
        [[1, 0], [0, 2]],
        [[3, 0, 0], [0, 5, 0], [0, 0, 7]],
      ]);
      expect(result.diagonalMatrices.count).toBe(2);
    });

    it('names diagonal matrices by index', () => {
      const result = service.calculateStats([
        [[5, 6], [7, 8]],
        [[1, 0], [0, 2]],
        [[0, 1], [1, 0]],
      ]);
      expect(result.diagonalMatrices.count).toBe(1);
      expect(result.diagonalMatrices.matrices[0].matrixIndex).toBe(1);
      expect(result.diagonalMatrices.matrices[0].name).toBe('R (Upper Triangular)');
    });

    it('handles near-zero off-diagonal elements with tolerance', () => {
      const result = service.calculateStats([[[1, 1e-15], [1e-15, 2]]]);
      expect(result.diagonalMatrices.count).toBe(1);
    });

    it('rejects matrix with significant off-diagonal', () => {
      const result = service.calculateStats([[[1, 0.001], [0.001, 2]]]);
      expect(result.diagonalMatrices.count).toBe(0);
    });

    it('handles floating point near-zero correctly', () => {
      const result = service.calculateStats([[[1, 0.845], [0.507, 0.276]]]);
      expect(result.diagonalMatrices.count).toBe(0);
    });

    it('handles empty stats scenario (no elements)', () => {
      const result = service.calculateStats([[[0]]]);
      expect(result.average).toBe(0);
      expect(result.diagonalMatrices.count).toBe(1);
      expect(result.diagonalMatrices.matrices[0].dimensions).toBe('1x1');
    });
  });
});
