import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';

export function useVideoProgress(id: MaybeRefOrGetter<number>) {
  const { data: continueWatching } = useContinueWatchingQuery();
  return computed(() => {
    const videoId = toValue(id);
    const entry = continueWatching.value?.video_id === videoId ? continueWatching.value : undefined;
    return {
      progressPercent: entry?.progress_percentage ?? 0,
      positionSeconds: entry?.position_seconds ?? 0,
    };
  });
}
