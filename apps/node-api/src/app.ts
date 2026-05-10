import cors from 'cors';
import express from 'express';
import { EnvConfig } from './config/env';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { StatsController } from './controllers/stats.controller';
import { errorMiddleware } from './middleware/error.middleware';
import { AuthRoutes } from './routes/auth.routes';
import { StatsRoutes } from './routes/stats.routes';
import { AuthService } from './services/auth.service';
import { StatsService } from './services/stats.service';
import { swaggerSpec } from './swagger';

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coding Challenge API (Node.js) - Swagger UI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

export class App {
  private readonly app: express.Application;
  private readonly config: EnvConfig;

  constructor() {
    this.config = new EnvConfig();
    this.app = express();
    this.setupMiddleware();
    this.setupSwagger();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors({ origin: this.config.CORS_ORIGIN }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupSwagger(): void {
    this.app.get('/api-docs.json', (_req, res) => {
      res.json(swaggerSpec);
    });

    this.app.get('/api-docs', (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(SWAGGER_HTML);
    });
  }

  private setupRoutes(): void {
    const statsService = new StatsService();
    const authService = new AuthService(this.config);

    const statsController = new StatsController(statsService);
    const authController = new AuthController(authService);
    const healthController = new HealthController(this.config);

    this.app.use(new StatsRoutes(statsController, this.config.JWT_SECRET).router);
    this.app.use(new AuthRoutes(authController).router);
    this.app.get('/health', healthController.check);
  }

  private setupErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  listen(): void {
    this.app.listen(this.config.PORT, () => {
      console.log(`🚀 Node API (Express 5) running on http://localhost:${this.config.PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${this.config.PORT}/api-docs`);
      console.log(`📄 OpenAPI JSON: http://localhost:${this.config.PORT}/api-docs.json`);
    });
  }
}
