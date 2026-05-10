import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthResponse, LoginRequest } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  async login(credentials: LoginRequest, apiUrl: string): Promise<AuthResponse> {
    const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error ?? 'Authentication failed';
      throw new Error(msg);
    }

    const data: AuthResponse = await res.json();
    this._token.set(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    this.router.navigate(['/overview']);
    return data;
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
