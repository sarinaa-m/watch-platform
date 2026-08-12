import { computed } from 'vue';
import type { Session } from '@domain/session';
import { authRepository } from '@infra/adapters/authRepositoryImpl';
import { useAuth } from '@infra/state/authState';
import { authKeys } from '@shared/api/queryKeys';
import { useMutation, useQuery } from '@tanstack/vue-query';

export const useRequestOtpMutation = () => {
  return useMutation({
    mutationFn: (identifier: string) => authRepository.requestOtp(identifier),
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: async ({
      identifier,
      otp,
    }: {
      identifier: string;
      otp: string;
    }): Promise<Session> => {
      const res = await authRepository.verifyOtp(identifier, otp);
      return {
        token: res.access_token,
        identifier,
        expiresAt: Date.now() + res.expires_in * 1000,
      };
    },
  });
};

export const useCurrentUserQuery = () => {
  const auth = useAuth();
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authRepository.getCurrentUser(),
    enabled: computed(() => auth.isAuthenticated.value),
  });
};
