import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';
import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuth } from '@infra/state/authState';
import { watchProgressKeys } from '@shared/api/queryKeys';
import type { UpdateWatchingDTO } from '@domain/ports';

export function useContinueWatchingQuery() {
  const auth = useAuth();
  return useQuery({
    queryKey: watchProgressKeys.all,
    queryFn: () => watchProgressRepository.getContinueWatching(),
    enabled: computed(() => auth.isAuthenticated.value),
  });
}

export function useSyncProgressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateWatchingDTO) => watchProgressRepository.updateWatchProgress(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(watchProgressKeys.continueWatching(), data);
    },
    retry: false,
  });
}
