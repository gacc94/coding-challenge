export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: 'Bearer';
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}
