export interface ApiError {
  status: number;
  error: string;
  message: string;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'error' in err;
}

export function isFatalApiError(err: unknown): boolean {
  return isApiError(err) && err.status >= 400 && err.status < 500;
}
