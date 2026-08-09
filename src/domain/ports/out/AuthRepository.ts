export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthRepository {
  requestOtp(identifier: string): Promise<void>;
  verifyOtp(identifier: string, otp: string): Promise<VerifyOtpResponse>;
  getCurrentUser(token: string): Promise<{ identifier: string }>;
}
