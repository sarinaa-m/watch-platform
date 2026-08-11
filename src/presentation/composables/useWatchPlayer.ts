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
import { isFatalApiError } from '@infra/api/httpClient';
import { formatTime } from '@shared/utils/formatTime';
import { useMovieItem } from '@application/usecases/movieUseCases';
import {
  useVideoProgress,
  useSyncProgressMutation,
} from '@application/usecases/watchProgressUseCases';
import type VideoPlayer from '@presentation/components/VideoPlayer.vue';

const SYNC_INTERVAL_MS = 8000;

export function useWatchPlayer(id: MaybeRefOrGetter<string | number>) {
  const videoId = computed(() => Number(toValue(id)));

  const { data: movie, isPending, error } = useMovieItem(videoId);
  const progress = useVideoProgress(videoId);
  const { mutateAsync: syncMutation } = useSyncProgressMutation();

  const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);
  const showToast = ref(false);
  const toastDetail = ref('');
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
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function flashToast(time: number): void {
    toastDetail.value = formatTime(time);
    showToast.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      showToast.value = false;
    }, 2000);
  }

  function stopSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  }

  /**
   * A 4xx from /watch-progress can never be fixed by sending the identical
   * body again — a rejected payload (400), an unknown video (404), or a dead
   * session (401, already handled centrally). Retrying every 8s would just
   * hammer the API, so the loop stops. Network errors keep retrying.
   */
  function handleSyncError(err: unknown): void {
    if (isFatalApiError(err)) stopSync();
  }

  function scheduleSync(): void {
    syncTimer = setInterval(() => {
      if (lastKnownPosition > 0) {
        syncProgress(lastKnownPosition)
          .then(() => flashToast(lastKnownPosition))
          .catch(handleSyncError);
      }
    }, SYNC_INTERVAL_MS);
  }

  function handleTimeUpdate(time: number): void {
    lastKnownPosition = time;
  }

  function handlePause(time: number): void {
    lastKnownPosition = time;
    syncProgress(time)
      .then(() => flashToast(time))
      .catch(handleSyncError);
  }

  function handleBeforeUnload(): void {
    // Best-effort sync when the tab/window is closing. sendBeacon can't set an
    // Authorization header, so this goes through the normal client with
    // `keepalive` so the request outlives the page.
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
    // A click is a user gesture, so this normally satisfies the autoplay policy;
    // if it still fails, fall back to the muted retry rather than failing silently.
    playerRef.value?.play().catch(() => playerRef.value?.attemptAutoplay());
  }

  // Autoplay was blocked and playback continues muted; surface the unmute path.
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

  // The sync loop only makes sense once there is a video to report progress
  // for, and it must restart when the route switches to another video.
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
    if (toastTimer) clearTimeout(toastTimer);
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
    showToast,
    toastDetail,
    autoplayBlocked,
    handleTimeUpdate,
    handlePause,
    handleBlocked,
    togglePlay,
    unmute,
    seekBar,
  };
}
