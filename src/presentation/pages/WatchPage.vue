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

const props = defineProps<{
  id: string | number;
}>();

const router = useRouter();
const watchStore = useWatchStore();

const movie = ref<Movie | null>(null);
const loading = ref(true);
const error = ref('');

// Resume position only applies if this is the video the user last left
// off on; otherwise a fresh video starts at 0.
const startPosition = computed(() => {
  const cw = watchStore.continueWatching;
  if (cw && cw.video_id === Number(props.id)) return cw.position_seconds;
  return 0;
});

let lastKnownPosition = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;

const SYNC_INTERVAL_MS = 8000;

function scheduleSync(): void {
  syncTimer = setInterval(() => {
    if (lastKnownPosition > 0) {
      watchStore.syncProgress(Number(props.id), lastKnownPosition).catch(() => {
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
  watchStore.syncProgress(Number(props.id), time).catch(() => {});
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
});
</script>

<template>
  <div class="watch">
    <button class="focusable back-btn" tabindex="0" @click="router.push({ name: 'home' })">
      ← بازگشت به فهرست
    </button>

    <p v-if="loading" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="movie">
      <VideoPlayer
        :src="movie.video_url"
        :start-position="startPosition"
        @timeupdate="handleTimeUpdate"
        @pause="handlePause"
      />
      <div class="details">
        <h1 class="movie-title">{{ movie.title }}</h1>
        <p class="movie-desc">{{ movie.description }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.watch {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.back-btn {
  align-self: flex-start;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.back-btn:hover,
.back-btn:focus-visible {
  color: var(--color-text);
  border-color: var(--color-teal);
}

.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.movie-title {
  font-size: 1.5rem;
}

.status {
  color: var(--color-text-muted);
}

.status.error {
  color: var(--color-pink);
}
</style>
