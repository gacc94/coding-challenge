import { Router } from 'express';
import type { StatsController } from '../controllers/stats.controller';
import { createJwtMiddleware } from '../middleware/jwt.middleware';

export class StatsRoutes {
  public readonly router: Router;

  constructor(
    controller: StatsController,
    jwtSecret: string,
  ) {
    this.router = Router();
    const jwtMiddleware = createJwtMiddleware(jwtSecret);
    this.router.post('/api/v1/stats', jwtMiddleware, controller.calculate);
  }
}
