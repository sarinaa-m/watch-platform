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

// Keyed by the `error` field of ErrorResponse (openapi.yaml#/components/schemas/ErrorResponse).
// network_error is synthesized client-side in httpClient when fetch itself fails.
const API_ERROR_MESSAGE_KEYS: Record<string, string> = {
  validation_error: 'errors.validationError',
  unsupported_media_type: 'errors.unsupportedMediaType',
  invalid_otp: 'errors.invalidOtp',
  unauthorized: 'errors.unauthorized',
  not_found: 'errors.notFound',
  network_error: 'errors.networkError',
};

export function getApiErrorMessageKey(err: unknown): string {
  if (isApiError(err) && err.error in API_ERROR_MESSAGE_KEYS) {
    return API_ERROR_MESSAGE_KEYS[err.error];
  }
  return 'errors.unknownError';
}
