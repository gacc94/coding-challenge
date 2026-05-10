import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller';

export class AuthRoutes {
  public readonly router: Router;

  constructor(controller: AuthController) {
    this.router = Router();
    this.router.post('/api/v1/auth/login', controller.login);
  }
}
