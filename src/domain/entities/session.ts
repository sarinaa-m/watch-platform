export interface Session {
  token: string;
  identifier: string;
  expiresAt: number;
}

export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
