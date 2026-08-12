import type { Session } from '@domain/entities/session';
import { authorityRepository } from '@infra/adapters/authRepositoryImpl';
import { useAuth } from '@infra/state/authState';
import { authKeys } from '@shared/api/queryKeys';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

export const useRequestOtpMutation = () => {
  return useMutation({
    mutationFn: (identifier: string) => authorityRepository.requestOtp(identifier),
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
      const res = await authorityRepository.verifyOtp(identifier, otp);
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
    queryFn: () => authorityRepository.getCurrentUser(),
    enabled: computed(() => auth.isAuthenticated.value),
  });
};
