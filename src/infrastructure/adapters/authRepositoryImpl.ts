import { httpClient } from '@infra/api/httpClient';
import type { VerifyOtpResponse } from '@domain/ports/out/AuthRepository';

// POST /auth/request-otp - always issues OTP "000000" per the challenge spec
export function requestOtp(identifier: string): Promise<void> {
  return httpClient.post<void>('/auth/request-otp', { identifier });
}

// POST /auth/verify-otp - returns { access_token, token_type, expires_in }
export function verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse> {
  return httpClient.post<VerifyOtpResponse>('/auth/verify-otp', { identifier, otp });
}

// GET /auth/me - returns { identifier }
export function getCurrentUser(token: string): Promise<{ identifier: string }> {
  return httpClient.get<{ identifier: string }>('/auth/me', { token });
}
