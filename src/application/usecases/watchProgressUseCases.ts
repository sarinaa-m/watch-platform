import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { watchProgressKeys } from '@shared/api/queryKeys';
import type { UpdateWatchingDTO } from '@domain/ports';
import { queryClient } from '@infra/query/queryClient';
import type { ContinueWatchingResponse } from '@domain/entities/watchProgress';

export function useContinueWatchingQuery() {
  return useQuery({
    queryKey: watchProgressKeys.continueWatching(),
    queryFn: () => watchProgressRepository.getContinueWatching(),
  });
}

export function useVideoProgress(id: MaybeRefOrGetter<number>) {
  const continueWatching = queryClient.getQueryData<ContinueWatchingResponse>(
    watchProgressKeys.continueWatching()
  );
  return computed(() => {
    const videoId = toValue(id);
    const entry = continueWatching?.data?.find((e) => e.video_id === videoId);
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
    onSuccess: (entry) => {
      queryClient.setQueryData<ContinueWatchingResponse>(
        watchProgressKeys.continueWatching(),
        (old) => {
          if (!old) return old;
          const index = old.data.findIndex((e) => e.video_id === entry.video_id);
          const data = [...old.data];
          if (index >= 0) {
            data[index] = entry;
          } else {
            data.unshift(entry);
          }
          return { ...old, data, total: index >= 0 ? old.total : old.total + 1 };
        }
      );
    },
    retry: false,
  });
}
