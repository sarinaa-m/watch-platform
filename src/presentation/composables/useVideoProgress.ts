import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { watchProgressKeys } from '@shared/api/queryKeys';
import { queryClient } from '@infra/query/queryClient';
import type { ContinueWatchingResponse } from '@domain/entities/watchProgress';

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
