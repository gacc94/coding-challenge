import { type Request, type Response } from 'express';
import type { EnvConfig } from '../config/env';

export class HealthController {
  constructor(private readonly config: EnvConfig) {}

  check = (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      service: 'node-api',
      timestamp: new Date().toISOString(),
      environment: this.config.NODE_ENV,
    });
  };
}
