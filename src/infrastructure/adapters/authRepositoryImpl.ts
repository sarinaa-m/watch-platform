import { httpClient } from '@infra/api/httpClient';
import type { AuthRepository, VerifyOtpResponse } from '@domain/ports/out/AuthRepository';

export const createAuthRepository = (): AuthRepository => ({
  async requestOtp(identifier: string): Promise<void> {
    return httpClient.post<void>('/auth/request-otp', { identifier });
  },
  async verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse> {
    return httpClient.post<VerifyOtpResponse>('/auth/verify-otp', { identifier, otp });
  },
  async getCurrentUser(token: string): Promise<{ identifier: string }> {
    return httpClient.get<{ identifier: string }>('/auth/me', { token });
  },
});

export const authorityRepository = createAuthRepository();
