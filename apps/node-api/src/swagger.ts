const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Coding Challenge API (Node.js)',
    version: '1.0.0',
    description: 'API para cálculo de estadísticas sobre matrices (Q, R, rotated)',
    contact: {
      name: 'División TI - Interseguro',
      email: 'desarrolloti@interseguro.pe',
    },
  },
  servers: [{ url: 'http://localhost:3002', description: 'Local' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      StatsResponse: {
        type: 'object',
        properties: {
          max: { type: 'number', example: 7.437 },
          min: { type: 'number', example: -0.345 },
          average: { type: 'number', example: 2.089 },
          sum: { type: 'number', example: 25.069 },
          totalElements: { type: 'integer', example: 12 },
          numberOfMatrices: { type: 'integer', example: 3 },
          diagonalMatrices: {
            type: 'object',
            properties: {
              count: { type: 'integer', example: 1 },
              matrices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    matrixIndex: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'R (Upper Triangular)' },
                    dimensions: { type: 'string', example: '2x2' },
                  },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'At least one matrix is required' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          status: { type: 'integer', example: 400 },
          details: { type: 'object', nullable: true },
        },
      },
      StatsRequest: {
        type: 'object',
        required: ['matrices'],
        properties: {
          matrices: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'array',
                items: { type: 'number' },
              },
            },
            example: [[[1, 2], [3, 4]], [[0.169, 0.897], [0.507, 0.276]]],
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', minLength: 6, example: 'secret' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          type: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'integer', example: 3600 },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'node-api' },
                    timestamp: { type: 'string' },
                    environment: { type: 'string', example: 'production' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuario',
        description: 'Obtiene un token JWT con credenciales validas',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token JWT generado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '400': {
            description: 'Error de validacion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciales invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/stats': {
      post: {
        tags: ['Stats'],
        summary: 'Calcular estadisticas de matrices',
        description: 'Recibe matrices Q, R y rotated, calcula maximo, minimo, promedio, suma y verifica matrices diagonales',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StatsRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Estadisticas calculadas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatsResponse' },
              },
            },
          },
          '400': {
            description: 'Error de validacion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Error interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export { swaggerSpec };
