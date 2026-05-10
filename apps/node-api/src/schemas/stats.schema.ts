import { z } from 'zod';

export const MatrixSchema = z.array(
  z.array(z.number()).min(1, 'Matrix row cannot be empty'),
).min(1, 'Matrix cannot be empty');

export const StatsRequestSchema = z.object({
  matrices: z.array(MatrixSchema).min(1, 'At least one matrix is required'),
});

export const StatsRequestRefinedSchema = StatsRequestSchema.refine(
  (data) => data.matrices.every((m) => m.every((row) => row.length === m[0].length)),
  { message: 'All rows in each matrix must have the same length' },
);

export type StatsRequest = z.infer<typeof StatsRequestSchema>;
