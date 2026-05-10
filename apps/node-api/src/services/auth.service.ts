import jwt from 'jsonwebtoken';
import type { EnvConfig } from '../config/env';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export class AuthService {
  constructor(private readonly config: EnvConfig) {}

  login(credentials: LoginRequest): LoginResponse {
    const { AUTH_USERNAME, AUTH_PASSWORD, JWT_SECRET, JWT_EXPIRATION } = this.config;

    if (credentials.username !== AUTH_USERNAME || credentials.password !== AUTH_PASSWORD) {
      throw new AuthError('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    }

    const payload = { sub: credentials.username };
    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRATION,
    });

    return {
      token,
      type: 'Bearer',
      expiresIn: JWT_EXPIRATION,
    };
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
