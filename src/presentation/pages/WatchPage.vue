<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { getMovieUseCase } from '@application/usecases/movieUseCases';
import { useWatchStore } from '@infra/storage/watchStore';
import { loadStoredSession } from '@shared/utils/sessionStorage';
import { envConfig } from '@config/env.config';
import type { Movie } from '@domain/entities/movie';
import type { ApiError } from '@infra/api/httpClient';
import VideoPlayer from '@presentation/components/VideoPlayer.vue';
import SyncToast from '@presentation/components/SyncToast.vue';

const props = defineProps<{
  id: string | number;
}>();

const router = useRouter();
const watchStore = useWatchStore();
const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);

const movie = ref<Movie | null>(null);
const loading = ref(true);
const error = ref('');
const showToast = ref(false);
const toastDetail = ref('');

// Resume position only applies if this is the video the user last left
// off on; otherwise a fresh video starts at 0.
const startPosition = computed(() => {
  const cw = watchStore.continueWatching;
  if (cw && cw.video_id === Number(props.id)) return cw.position_seconds;
  return 0;
});

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

function scheduleSync(): void {
  syncTimer = setInterval(() => {
    if (lastKnownPosition > 0) {
      watchStore
        .syncProgress(Number(props.id), lastKnownPosition)
        .then(() => flashToast(lastKnownPosition))
        .catch(() => {
          // Non-fatal: next periodic tick or pause/leave sync will retry.
        });
    }
  }, SYNC_INTERVAL_MS);
}

function handleTimeUpdate(time: number): void {
  lastKnownPosition = time;
}

function handlePause(time: number): void {
  lastKnownPosition = time;
  watchStore
    .syncProgress(Number(props.id), time)
    .then(() => flashToast(time))
    .catch(() => {});
}

function handleBeforeUnload(): void {
  // Best-effort sync when the tab/window is closing.
  if (lastKnownPosition > 0) {
    const session = loadStoredSession();
    if (!session?.token) return;
    const url = `${envConfig.baseApiUrl}/watch-progress`;
    const body = JSON.stringify({
      video_id: Number(props.id),
      position_seconds: lastKnownPosition,
    });
    // sendBeacon can't set custom headers for auth, so PUT via fetch with
    // keepalive as a best-effort fallback for the unload case.
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

onBeforeRouteLeave(() => {
  if (lastKnownPosition > 0) {
    watchStore.syncProgress(Number(props.id), lastKnownPosition).catch(() => {});
  }
});

function togglePlay(): void {
  if (paused.value) playerRef.value?.play();
  else playerRef.value?.pause();
}

function seekBar(e: MouseEvent): void {
  const track = e.currentTarget as HTMLElement;
  const rect = track.getBoundingClientRect();
  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  playerRef.value?.seekTo(fraction * duration.value);
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  try {
    movie.value = await getMovieUseCase(props.id);
    scheduleSync();
  } catch (err) {
    error.value = (err as Partial<ApiError>).message || 'ویدیو یافت نشد.';
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (syncTimer) clearInterval(syncTimer);
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<template>
  <div class="watch">
    <p v-if="loading" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="movie">
      <VideoPlayer
        ref="playerRef"
        :src="movie.video_url"
        :start-position="startPosition"
        @timeupdate="handleTimeUpdate"
        @pause="handlePause"
      />

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
