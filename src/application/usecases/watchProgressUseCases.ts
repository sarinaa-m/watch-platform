import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { watchProgressKeys } from '@shared/api/queryKeys';
import type { UpdateWatchingDTO } from '@domain/entities';
import type { ContinueWatchingResponse } from '@domain/entities/watchProgress';

export function useContinueWatchingQuery() {
  return useQuery({
    queryKey: watchProgressKeys.continueWatching(),
    queryFn: () => watchProgressRepository.getContinueWatching(),
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
          return { data, total: index >= 0 ? old.total : old.total + 1 };
        }
      );
    },
    retry: false,
  });
}
