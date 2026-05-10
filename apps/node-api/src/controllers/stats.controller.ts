import { type Request, type Response } from 'express';
import type { StatsService } from '../services/stats.service';
import { StatsRequestRefinedSchema } from '../schemas/stats.schema';

/**
 * @swagger
 * /api/v1/stats:
 *   post:
 *     summary: Calcular estadísticas de matrices
 *     description: Recibe matrices Q, R y rotated, calcula máximo, mínimo, promedio, suma y verifica matrices diagonales
 *     tags: [Stats]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatsRequest'
 *     responses:
 *       200:
 *         description: Estadísticas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  calculate = (req: Request, res: Response): void => {
    const parsed = StatsRequestRefinedSchema.safeParse(req.body);

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
      const result = this.statsService.calculateStats(parsed.data.matrices);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to calculate statistics',
        code: 'STATS_CALCULATION_ERROR',
        status: 500,
      });
    }
  };
}
