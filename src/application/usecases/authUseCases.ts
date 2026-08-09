import { requestOtp, verifyOtp, getCurrentUser } from '@infra/adapters/authRepositoryImpl';
import type { Session } from '@domain/entities/session';

export async function requestOtpUseCase(identifier: string): Promise<void> {
  await requestOtp(identifier);
}

export async function verifyOtpUseCase(identifier: string, otp: string): Promise<Session> {
  const res = await verifyOtp(identifier, otp);
  return {
    token: res.access_token,
    identifier,
    expiresAt: Date.now() + res.expires_in * 1000,
  };
}

export async function fetchCurrentUserUseCase(token: string): Promise<string> {
  const res = await getCurrentUser(token);
  return res.identifier;
}
