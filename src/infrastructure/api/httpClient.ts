import { envConfig } from '@config/env.config';

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

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  keepalive?: boolean;
}

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
