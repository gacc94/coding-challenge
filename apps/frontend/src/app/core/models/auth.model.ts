export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  expiresIn: number;
}
