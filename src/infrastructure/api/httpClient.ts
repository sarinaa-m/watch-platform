import { envConfig } from '@config/env.config';

export interface ApiError {
  status: number;
  error: string;
  message: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/**
 * Thin fetch wrapper.
 * - Prefixes every call with the API base URL
 * - Attaches the Bearer token when present
 * - Normalizes errors into a single shape: { status, error, message }
 * - Emits a `auth:unauthorized` window event on 401 so the app can react
 *   (e.g. clear the session and redirect to /login) without every call
 *   site needing to know about routing.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;
  const finalHeaders: Record<string, string> = { ...headers };
  let finalBody: BodyInit | undefined;

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${envConfig.baseApiUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
    });
  } catch {
    throw { status: 0, error: 'network_error', message: 'Could not reach the server.' } as ApiError;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
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
