export interface ErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
}
