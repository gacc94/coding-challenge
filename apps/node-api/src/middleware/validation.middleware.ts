import { type Request, type Response, type NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: result.error.issues[0].message,
        code: 'VALIDATION_ERROR',
        status: 400,
        details: result.error.issues,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
