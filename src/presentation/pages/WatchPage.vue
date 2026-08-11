<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { isFatalApiError } from '@infra/api/httpClient';
import VideoPlayer from '@presentation/components/VideoPlayer.vue';
import SyncToast from '@presentation/components/SyncToast.vue';
import { useMovieItem } from '@application/usecases/movieUseCases';
import {
  useVideoProgress,
  useSyncProgressMutation,
} from '@application/usecases/watchProgressUseCases';

const props = defineProps<{
  id: string | number;
}>();

const router = useRouter();
const progress = useVideoProgress(() => Number(props.id));
const { mutateAsync: syncMutation } = useSyncProgressMutation();

function syncProgress(positionSeconds: number, keepalive = false) {
  return syncMutation({
    videoId: Number(props.id),
    positionSeconds,
    keepalive,
  });
}
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

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

let lastKnownPosition = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const SYNC_INTERVAL_MS = 8000;

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

const { data: movie, isPending, error } = useMovieItem(() => Number(props.id));

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
</script>

<template>
  <div class="watch">
    <p v-if="isPending" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>

    <template v-else-if="movie">
      <VideoPlayer
        ref="playerRef"
        :src="movie.video_url"
        :start-position="startPosition"
        autoplay
        @timeupdate="handleTimeUpdate"
        @pause="handlePause"
        @blocked="handleBlocked"
      />

      <button v-if="autoplayBlocked" class="focusable unmute-banner" tabindex="0" @click="unmute">
        🔇 پخش بی‌صدا شروع شد — برای شنیدن صدا کلیک کنید
      </button>

      <div class="top-bar">
        <button
          class="focusable back-btn"
          tabindex="0"
          @click="router.push({ name: 'title', params: { id: props.id } })"
        >
          → بازگشت
        </button>
        <div class="titles">
          <div class="title">{{ movie.title }}</div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="scrub">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <div class="track" @click="seekBar">
            <div class="fill" :style="{ width: progressPercent + '%' }" />
          </div>
          <span class="time muted">{{ formatTime(duration) }}</span>
        </div>

        <div class="controls">
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(-10)">⟲ ۱۰</button>
          <button class="focusable ctrl" tabindex="0" @click="togglePlay">
            {{ paused ? '▶ پخش' : '❚❚ توقف' }}
          </button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(10)">۱۰ ⟳</button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.toggleMute()">
            {{ muted ? 'صدا: بی‌صدا' : 'صدا: روشن' }}
          </button>
        </div>
      </div>

      <SyncToast v-if="showToast" :detail="toastDetail" />
    </template>
  </div>
</template>

<style scoped>
.watch {
  position: relative;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.status {
  padding: var(--space-5);
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}

.unmute-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.unmute-banner:hover,
.unmute-banner:focus-visible {
  background: rgba(0, 0, 0, 0.85);
}

.top-bar {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  z-index: 2;
}

.back-btn {
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.back-btn:hover,
.back-btn:focus-visible {
  background: rgba(255, 255, 255, 0.16);
}

.titles {
  display: grid;
  gap: 4px;
}

.titles .title {
  font-size: 1.15rem;
  font-weight: 700;
}

.bottom-bar {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  z-index: 2;
  display: grid;
  gap: var(--space-3);
}

.scrub {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.time {
  font-size: 0.85rem;
  color: #e5e7eb;
  font-variant-numeric: tabular-nums;
}

.time.muted {
  color: var(--color-text-muted);
}

.track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ctrl {
  min-width: 44px;
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.ctrl:hover,
.ctrl:focus-visible {
  background: rgba(255, 255, 255, 0.16);
}

/* Top/bottom gradient scrims so controls stay legible over any frame */
.watch::before,
.watch::after {
  content: '';
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.watch::before {
  top: 0;
  height: 30%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
}

.watch::after {
  bottom: 0;
  height: 35%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0));
}
</style>
