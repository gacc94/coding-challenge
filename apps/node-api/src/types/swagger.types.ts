/**
 * @swagger
 * components:
 *   schemas:
 *     StatsResponse:
 *       type: object
 *       properties:
 *         max:
 *           type: number
 *           example: 7.437
 *         min:
 *           type: number
 *           example: -0.345
 *         average:
 *           type: number
 *           example: 2.089
 *         sum:
 *           type: number
 *           example: 25.069
 *         totalElements:
 *           type: integer
 *           example: 12
 *         numberOfMatrices:
 *           type: integer
 *           example: 3
 *         diagonalMatrices:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               example: 1
 *             matrices:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   matrixIndex:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "R (Upper Triangular)"
 *                   dimensions:
 *                     type: string
 *                     example: "2x2"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "At least one matrix is required"
 *         code:
 *           type: string
 *           example: "VALIDATION_ERROR"
 *         status:
 *           type: integer
 *           example: 400
 *         details:
 *           type: object
 *           nullable: true
 *     StatsRequest:
 *       type: object
 *       required:
 *         - matrices
 *       properties:
 *         matrices:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: array
 *               items:
 *                 type: number
 *           example:
 *             - [[1, 2], [3, 4]]
 *             - [[0.169, 0.897], [0.507, 0.276]]
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "admin"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "secret"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIs..."
 *         type:
 *           type: string
 *           example: "Bearer"
 *         expiresIn:
 *           type: integer
 *           example: 3600
 */

export { type StatsResponse, type DiagonalResult, type DiagonalMatrixInfo } from './matrix.types';
export { type ErrorResponse } from './error.types';
