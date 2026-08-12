import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  toValue,
  type MaybeRefOrGetter,
} from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { isFatalApiError } from '@shared/api/apiError';
import { useMovieItem } from '@application/usecases/movieUseCases';
import { useSyncProgressMutation } from '@application/usecases/watchProgressUseCases';
import { useVideoProgress } from '@presentation/composables/useVideoProgress';
import type VideoPlayer from '@presentation/components/VideoPlayer.vue';

const SYNC_INTERVAL_MS = 8000;

export function useWatchPlayer(id: MaybeRefOrGetter<string | number>) {
  const videoId = computed(() => Number(toValue(id)));

  const { data: movie, isPending, error } = useMovieItem(videoId);
  const progress = useVideoProgress(videoId);
  const { mutateAsync: syncMutation } = useSyncProgressMutation();

  const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);
  const autoplayBlocked = ref(false);

  const startPosition = computed(() => progress.value.positionSeconds);
  const currentTime = computed(() => playerRef.value?.currentTime ?? 0);
  const duration = computed(() => playerRef.value?.duration ?? 0);
  const paused = computed(() => playerRef.value?.paused ?? true);
  const muted = computed(() => playerRef.value?.muted ?? false);
  const progressPercent = computed(() =>
    duration.value > 0 ? Math.min(100, (currentTime.value / duration.value) * 100) : 0
  );

  function syncProgress(positionSeconds: number, keepalive = false) {
    return syncMutation({ videoId: videoId.value, positionSeconds, keepalive });
  }

  let lastKnownPosition = 0;
  let syncTimer: ReturnType<typeof setInterval> | null = null;

  function stopSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  }

  function handleSyncError(err: unknown): void {
    if (isFatalApiError(err)) stopSync();
  }

  function scheduleSync(): void {
    syncTimer = setInterval(() => {
      if (lastKnownPosition > 0) {
        syncProgress(lastKnownPosition).catch(handleSyncError);
      }
    }, SYNC_INTERVAL_MS);
  }

  function handleTimeUpdate(time: number): void {
    lastKnownPosition = time;
  }

  function handlePause(time: number): void {
    lastKnownPosition = time;
    syncProgress(time).catch(handleSyncError);
  }

  function handleBeforeUnload(): void {
    if (lastKnownPosition > 0) {
      syncProgress(lastKnownPosition, true).catch(() => {});
    }
  }

  onBeforeRouteLeave(() => {
    if (lastKnownPosition > 0) {
      syncProgress(lastKnownPosition).catch(() => {});
    }
  });

  function togglePlay(): void {
    if (!paused.value) {
      playerRef.value?.pause();
      return;
    }
    playerRef.value?.play().catch(() => playerRef.value?.attemptAutoplay());
  }

  function handleBlocked(): void {
    autoplayBlocked.value = true;
  }

  function unmute(): void {
    playerRef.value?.toggleMute();
    autoplayBlocked.value = false;
  }

  function seekBar(e: MouseEvent): void {
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playerRef.value?.seekTo(fraction * duration.value);
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  watch(
    movie,
    (loaded) => {
      stopSync();
      lastKnownPosition = 0;
      if (loaded) scheduleSync();
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    stopSync();
  });

  return {
    playerRef,
    movie,
    isPending,
    error,
    startPosition,
    currentTime,
    duration,
    paused,
    muted,
    progressPercent,
    autoplayBlocked,
    handleTimeUpdate,
    handlePause,
    handleBlocked,
    togglePlay,
    unmute,
    seekBar,
  };
}
