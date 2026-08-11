import type { VerifyOtpResponse } from '@domain/entities';

export interface AuthRepository {
  requestOtp(identifier: string): Promise<void>;
  verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse>;
  getCurrentUser(): Promise<{ identifier: string }>;
}
