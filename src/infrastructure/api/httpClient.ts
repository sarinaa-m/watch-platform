import { envConfig } from '@config/env.config';
import type { ApiError } from '@shared/api/apiError';

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

let unauthorizedHandler: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
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
      unauthorizedHandler();
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
