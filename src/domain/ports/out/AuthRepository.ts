import type { GetOtpResponse, VerifyOtpResponse } from '@domain/entities';

export interface AuthRepository {
  requestOtp(identifier: string): Promise<GetOtpResponse>;
  verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse>;
  getCurrentUser(): Promise<{ identifier: string }>;
}
