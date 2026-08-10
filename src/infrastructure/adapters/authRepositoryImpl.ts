import { httpClient } from '@infra/api/httpClient';
import type { AuthRepository } from '@domain/ports';
import type { VerifyOtpResponse } from '@domain/entities';

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
