import { computed } from 'vue';
import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';
import { useAuth } from '@infra/state/authState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { watchProgressKeys } from '@shared/api/queryKeys';
import type { ContinueWatchingResponse, UpdateWatchingDTO } from '@domain/watchProgress';

export function useContinueWatchingQuery() {
  const auth = useAuth();
  return useQuery({
    queryKey: computed(() => watchProgressKeys.continueWatching(auth.state.identifier ?? '')),
    queryFn: () => watchProgressRepository.getContinueWatching(),
    enabled: computed(() => auth.isAuthenticated.value),
    select(data) {
      //based on what in openapi.yaml the response is always one item
      return data.data?.[0];
    },
  });
}

export function useSyncProgressMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateWatchingDTO) => {
      const identifier = auth.state.identifier;
      const entry = await watchProgressRepository.updateWatchProgress(dto);
      return { identifier, entry };
    },
    onSuccess: ({ identifier, entry }) => {
      if (!identifier) return;
      queryClient.setQueryData<ContinueWatchingResponse>(
        watchProgressKeys.continueWatching(identifier),
        (old) => (old ? { ...old, data: [entry] } : { data: [entry], total: 1 })
      );
    },
    retry: false,
  });
}
