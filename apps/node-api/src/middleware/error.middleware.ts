import { type Request, type Response, type NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    status: 500,
  });
}
