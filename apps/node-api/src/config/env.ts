export class EnvConfig {
  readonly PORT: number;
  readonly JWT_SECRET: string;
  readonly JWT_EXPIRATION: number;
  readonly AUTH_USERNAME: string;
  readonly AUTH_PASSWORD: string;
  readonly NODE_ENV: string;
  readonly CORS_ORIGIN: string;

  constructor() {
    this.PORT = parseInt(process.env.PORT ?? '3002', 10);
    this.JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret-change-in-production';
    this.JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION ?? '3600', 10);
    this.AUTH_USERNAME = process.env.AUTH_USERNAME ?? 'admin';
    this.AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? 'secret';
    this.NODE_ENV = process.env.NODE_ENV ?? 'development';
    this.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';
  }
}
