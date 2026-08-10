import type { Session } from '@domain/entities/session';
import { authorityRepository } from '@infra/adapters/authRepositoryImpl';
import { useMutation } from '@tanstack/vue-query';

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: (identifier: string) => authorityRepository.requestOtp(identifier),
  });
};

export async function requestOtpUseCase(identifier: string): Promise<void> {
  await authorityRepository.requestOtp(identifier);
}

export async function verifyOtpUseCase(identifier: string, otp: string): Promise<Session> {
  const res = await authorityRepository.verifyOtp(identifier, otp);
  return {
    token: res.access_token,
    identifier,
    expiresAt: Date.now() + res.expires_in * 1000,
  };
}

export async function fetchCurrentUserUseCase(token: string): Promise<string> {
  const res = await authorityRepository.getCurrentUser(token);
  return res.identifier;
}
