import { httpClient } from '@infra/api/httpClient';
import type { VerifyOtpResponse, GetOtpResponse } from '@domain/entities';

export const createAuthRepository = () => ({
  async requestOtp(identifier: string): Promise<GetOtpResponse> {
    return httpClient.post<GetOtpResponse>('/auth/request-otp', { identifier }, { auth: false });
  },
  async verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse> {
    return httpClient.post<VerifyOtpResponse>(
      '/auth/verify-otp',
      { identifier, otp },
      { auth: false }
    );
  },
  async getCurrentUser(): Promise<{ identifier: string }> {
    return httpClient.get<{ identifier: string }>('/auth/me');
  },
});

export const authorityRepository = createAuthRepository();
