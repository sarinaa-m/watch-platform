import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuth } from '@infra/state/authState';
import { watchProgressKeys } from '@shared/api/queryKeys';
import type { UpdateWatchingDTO } from '@domain/ports';

export function useContinueWatchingQuery() {
  const auth = useAuth();
  return useQuery({
    queryKey: watchProgressKeys.continueWatching(),
    queryFn: () => watchProgressRepository.getContinueWatching(),
    enabled: computed(() => auth.isAuthenticated.value),
  });
}

export function useVideoProgress(id: MaybeRefOrGetter<number>) {
  const { data: continueWatching } = useContinueWatchingQuery();
  return computed(() => {
    const videoId = toValue(id);
    const entry = continueWatching.value?.data.find((e) => e.video_id === videoId);
    return {
      progressPercent: entry?.progress_percentage ?? 0,
      positionSeconds: entry?.position_seconds ?? 0,
    };
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
