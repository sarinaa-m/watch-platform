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
import { onBeforeLogout } from '@infra/state/authState';
import { useMovieItem } from '@application/usecases/movieUseCases';
import { useSyncProgressMutation } from '@application/usecases/watchProgressUseCases';
import { useVideoProgress } from '@presentation/composables/useVideoProgress';
import type VideoPlayer from '@presentation/components/VideoPlayer.vue';

const SYNC_INTERVAL_MS = 10_000;

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

  const removeBeforeLogoutHook = onBeforeLogout(() => {
    if (lastKnownPosition > 0) {
      return syncProgress(lastKnownPosition);
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
    if (!Number.isFinite(duration.value) || duration.value <= 0) return;
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = fraction * duration.value;
    playerRef.value?.seekTo(targetTime);
    lastKnownPosition = targetTime;
    syncProgress(targetTime).catch(handleSyncError);
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  watch(
    [videoId, () => !!movie.value],
    ([, hasMovie], previous) => {
      if (previous && previous[0] !== videoId.value) lastKnownPosition = 0;
      stopSync();
      if (hasMovie) scheduleSync();
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    stopSync();
    removeBeforeLogoutHook();
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
