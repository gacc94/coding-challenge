import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/auth.types';

export function createJwtMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Authorization header is required',
        code: 'AUTH_MISSING_TOKEN',
        status: 401,
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authorization header must be "Bearer <token>"',
        code: 'AUTH_INVALID_FORMAT',
        status: 401,
      });
      return;
    }

    try {
      const token = authHeader.substring(7);
      req.user = jwt.verify(token, secret) as JwtPayload;
      next();
    } catch {
      res.status(401).json({
        error: 'Invalid or expired token',
        code: 'AUTH_INVALID_TOKEN',
        status: 401,
      });
    }
  };
}
