/* ── Codigos de error de la Go API + Node API ──── */

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_MISSING_TOKEN'
  | 'AUTH_INVALID_FORMAT'
  | 'AUTH_INVALID_TOKEN'
  | 'QR_FACTORIZATION_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  status?: number;
  details?: unknown;
}

/* ── Mapa de mensajes amigables ────────────────── */

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Validation error — please check your input.',
  AUTH_INVALID_CREDENTIALS: 'Invalid username or password.',
  AUTH_MISSING_TOKEN: 'Authentication required. Please sign in again.',
  AUTH_INVALID_FORMAT: 'Invalid authorization format.',
  AUTH_INVALID_TOKEN: 'Your session has expired. Please sign in again.',
  QR_FACTORIZATION_ERROR:
    'QR factorization failed. The matrix may be singular or rank-deficient. Ensure rows ≥ columns.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

/* ── Parser ────────────────────────────────────── */

function isApiErrorBody(o: unknown): o is ApiErrorBody {
  return (
    !!o &&
    typeof o === 'object' &&
    'code' in o &&
    'error' in o &&
    typeof (o as Record<string, unknown>)['error'] === 'string'
  );
}

export function parseApiError(err: unknown): ApiErrorBody {
  // Caso 1: HttpErrorResponse (de httpResource / HttpClient)
  // Tiene .status y .error con el body ya parseado por el interceptor JSON
  if (err && typeof err === 'object' && 'status' in err) {
    const httpErr = err as { status: number; message?: string; error?: unknown };
    if (isApiErrorBody(httpErr.error)) {
      return { ...httpErr.error, status: httpErr.status };
    }
    return {
      error: httpErr.message ?? `${httpErr.status} error`,
      code: 'INTERNAL_ERROR',
      status: httpErr.status,
    };
  }

  // Caso 2: Error generico con mensaje
  if (err instanceof Error) {
    return { error: err.message, code: 'INTERNAL_ERROR' };
  }

  // Caso 3: String directo
  if (typeof err === 'string') {
    return { error: err, code: 'INTERNAL_ERROR' };
  }

  return { error: 'Unknown error', code: 'INTERNAL_ERROR' };
}

/* ── Formateador ───────────────────────────────── */

export function formatApiError(err: unknown): string {
  const body = parseApiError(err);

  const serverMsg = body.error?.trim();
  if (serverMsg && body.code !== 'INTERNAL_ERROR') {
    return serverMsg;
  }

  const friendly = ERROR_MESSAGES[body.code] ?? ERROR_MESSAGES.INTERNAL_ERROR;
  return serverMsg && serverMsg !== 'Unknown error' ? serverMsg : friendly;
}

export function getErrorCode(err: unknown): ApiErrorCode {
  return parseApiError(err).code;
}
