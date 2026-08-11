import { envConfig } from '@config/env.config';

export interface ApiError {
  status: number;
  error: string;
  message: string;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'error' in err;
}

/**
 * True when retrying the identical request can never succeed: a rejected
 * body (400), an unknown video/route (404), a bad Content-Type (415), or a
 * dead session (401). Only `network_error` (status 0) and 5xx are worth
 * retrying.
 */
export function isFatalApiError(err: unknown): boolean {
  return isApiError(err) && err.status >= 400 && err.status < 500;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  /**
   * Set to false for the endpoints the spec marks `security: []`
   * (/health, /movies, /movies/{id}, /auth/*). Everything else picks up
   * the ambient session token automatically.
   */
  auth?: boolean;
  headers?: Record<string, string>;
  /**
   * Let the request outlive the page (`beforeunload`). sendBeacon can't set
   * an Authorization header, so keepalive + fetch is the only way to make an
   * authenticated best-effort write on unload.
   */
  keepalive?: boolean;
}

/**
 * The session token is ambient context, not a per-call argument: auth
 * state registers a getter here at startup so no call site can forget
 * the header or pass an empty string.
 */
let tokenProvider: () => string | null = () => null;

export function setTokenProvider(provider: () => string | null): void {
  tokenProvider = provider;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {}, keepalive = false } = options;
  const finalHeaders: Record<string, string> = { ...headers };
  let finalBody: BodyInit | undefined;

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const token = auth ? tokenProvider() : null;
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${envConfig.baseApiUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
      keepalive,
    });
  } catch {
    throw { status: 0, error: 'network_error', message: 'Could not reach the server.' } as ApiError;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // A 401 means two different things in this API. On /auth/verify-otp it
    // is `invalid_otp` on a request that carried no token — a form error,
    // which must stay on the login page. Everywhere else it means the JWT
    // we *did* send is missing/invalid/expired, i.e. the session is dead.
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw {
      status: response.status,
      error: data?.error ?? 'unknown_error',
      message: data?.message ?? 'Something went wrong.',
    } as ApiError;
  }

  return data as T;
}

export const httpClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
};
