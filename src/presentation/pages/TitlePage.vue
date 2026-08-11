<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieItem } from '@application/usecases/movieUseCases';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';

const props = defineProps<{ id: string | number }>();

const router = useRouter();
const { data: continueWatching } = useContinueWatchingQuery();

const progressPercent = computed(() => {
  const cw = continueWatching.value;
  const cwIndex = cw?.data.find((entry) => entry.video_id === Number(props.id));
  if (cwIndex) return cwIndex.progress_percentage;
  return 0;
});

const statusLabel = computed(() => {
  if (progressPercent.value >= 98) return '✓ دیده‌شده';
  if (progressPercent.value > 2) return `ادامه از ${Math.round(progressPercent.value)}٪`;
  return 'تماشا نشده';
});

const playLabel = computed(() => (progressPercent.value > 2 ? '▶ ادامه تماشا' : '▶ شروع تماشا'));

function play(): void {
  router.push({ name: 'watch', params: { id: props.id } });
}

const { data: movie, isPending, error } = useMovieItem(() => Number(props.id));
</script>

<template>
  <div class="title-page">
    <button class="focusable back-btn" tabindex="0" @click="router.push({ name: 'home' })">
      → بازگشت
    </button>

    <p v-if="isPending" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>

    <template v-else-if="movie">
      <div class="hero" :style="{ backgroundImage: `url(${movie.cover_image})` }">
        <div class="scrim" />
        <div class="hero-content">
          <h1 class="title">{{ movie.title }}</h1>
          <p class="desc">{{ movie.description }}</p>
          <button class="focusable play-btn" tabindex="0" @click="play">{{ playLabel }}</button>
        </div>
      </div>

      <div class="episodes">
        <h2 class="section-title">قسمت‌ها</h2>
        <div class="episode-row focusable" tabindex="0" @click="play" @keydown.enter="play">
          <div class="episode-num">۱</div>
          <div class="episode-thumb" :style="{ backgroundImage: `url(${movie.cover_image})` }">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: Math.min(100, progressPercent) + '%' }" />
            </div>
          </div>
          <div class="episode-meta">
            <div class="episode-title">{{ movie.title }}</div>
            <div class="episode-status">{{ statusLabel }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.title-page {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.back-btn {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.back-btn:hover,
.back-btn:focus-visible {
  color: var(--color-text);
  border-color: var(--color-accent);
}

.hero {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  min-height: 300px;
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    #0b111c 5%,
    rgba(11, 17, 28, 0.75) 45%,
    rgba(11, 17, 28, 0.35) 100%
  );
}

.hero-content {
  position: relative;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 640px;
}

.title {
  font-size: 1.9rem;
  line-height: 1.25;
}

.desc {
  color: #d1d5db;
  line-height: 1.75;
}

.play-btn {
  justify-self: start;
  padding: 12px 26px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  border: none;
}

.play-btn:hover,
.play-btn:focus-visible {
  background: #1e5ab8;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.episode-row {
  display: grid;
  grid-template-columns: 32px minmax(160px, 240px) 1fr;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.episode-row:hover,
.episode-row:focus-visible {
  background: rgba(42, 111, 219, 0.12);
}

.episode-num {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-align: center;
}

.episode-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.18);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.episode-meta {
  display: grid;
  gap: var(--space-1);
}

.episode-title {
  font-weight: 600;
}

.episode-status {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.status {
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}
</style>
