import { describe, it, expect, beforeEach } from 'vitest';
import { StatsRequestSchema, StatsRequestRefinedSchema } from '../../../src/schemas/stats.schema';
import { LoginRequestSchema } from '../../../src/schemas/auth.schema';

describe('StatsRequestSchema', () => {
  it('accepts valid single matrix', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[1, 2], [3, 4]]],
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple matrices', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[1, 2]], [[3, 4]], [[5, 6]]],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty matrices array', () => {
    const result = StatsRequestSchema.safeParse({ matrices: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('At least one matrix is required');
  });

  it('rejects matrix with empty row', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[]]],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Matrix row cannot be empty');
  });

  it('rejects empty matrix', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[]],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Matrix cannot be empty');
  });

  it('rejects non-numeric values in matrix', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[1, 'invalid']]],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('expected number');
  });

  it('accepts floating point numbers', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[0.169, 0.897], [0.507, 0.276]]],
    });
    expect(result.success).toBe(true);
  });

  it('accepts negative numbers', () => {
    const result = StatsRequestSchema.safeParse({
      matrices: [[[-1, -2], [-3, -4]]],
    });
    expect(result.success).toBe(true);
  });

  describe('StatsRequestRefinedSchema', () => {
    it('accepts consistent rows', () => {
      const result = StatsRequestRefinedSchema.safeParse({
        matrices: [[[1, 2], [3, 4]]],
      });
      expect(result.success).toBe(true);
    });

    it('rejects inconsistent rows', () => {
      const result = StatsRequestRefinedSchema.safeParse({
        matrices: [[[1, 2], [3, 4, 5]]],
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('All rows in each matrix must have the same length');
    });
  });
});

describe('LoginRequestSchema', () => {
  it('accepts valid credentials', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'admin',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty username', () => {
    const result = LoginRequestSchema.safeParse({
      username: '',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Username is required');
  });

  it('rejects short password', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'admin',
      password: '12345',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Password must be at least 6 characters');
  });

  it('rejects missing username', () => {
    const result = LoginRequestSchema.safeParse({ password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = LoginRequestSchema.safeParse({ username: 'admin' });
    expect(result.success).toBe(false);
  });
});
