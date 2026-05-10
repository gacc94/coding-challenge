import { type Request, type Response } from 'express';
import { AuthService, AuthError } from '../services/auth.service';
import { LoginRequestSchema } from '../schemas/auth.schema';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Autenticar usuario
 *     description: Obtiene un token JWT con credenciales válidas
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Token JWT generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = (req: Request, res: Response): void => {
    const parsed = LoginRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0].message,
        code: 'VALIDATION_ERROR',
        status: 400,
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const result = this.authService.login(parsed.data);
      res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(401).json({
          error: error.message,
          code: error.code,
          status: 401,
        });
        return;
      }
      throw error;
    }
  };
}
