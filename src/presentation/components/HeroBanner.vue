<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Movie } from '@domain/entities/movie';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';
import { usePlaybackStatusLabels } from '@presentation/composables/usePlaybackStatusLabels';

const props = withDefaults(
  defineProps<{
    movie: Movie;
    progressPercent?: number;
    isContinueWatching?: boolean;
  }>(),
  { progressPercent: 0, isContinueWatching: false }
);

const router = useRouter();
const { playLabel } = usePlaybackStatusLabels(() => props.progressPercent);

function play(): void {
  router.push({ name: 'watch', params: { id: props.movie.id } });
}

function moreInfo(): void {
  router.push({ name: 'title', params: { id: props.movie.id } });
}
</script>

<template>
  <section class="hero" :style="{ backgroundImage: `url(${movie.cover_image})` }">
    <div class="scrim" />
    <div class="hero-content">
      <span v-if="isContinueWatching" class="eyebrow">{{ $t('home.continueWatchingTitle') }}</span>
      <h1 class="title">{{ movie.title }}</h1>
      <p class="desc">{{ movie.description }}</p>
      <div v-if="progressPercent > 0" class="progress-track">
        <div class="progress-fill" :style="{ width: Math.min(100, progressPercent) + '%' }" />
      </div>
      <FocusableGrid>
        <div class="hero-actions">
          <button class="focusable play-btn" tabindex="0" @click="play">▶ {{ playLabel }}</button>
          <button class="focusable info-btn" tabindex="0" @click="moreInfo">
            {{ $t('home.moreInfo') }}
          </button>
        </div>
      </FocusableGrid>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  min-height: 440px;
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
  margin-bottom: var(--space-6);
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    #0b111c 6%,
    rgba(11, 17, 28, 0.78) 45%,
    rgba(11, 17, 28, 0.3) 100%
  );
}

.hero-content {
  position: relative;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 640px;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-strong);
}

.title {
  font-size: 2.4rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.desc {
  color: #d1d5db;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-track {
  width: 100%;
  max-width: 320px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.play-btn {
  padding: 14px 28px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  border: none;
}

.play-btn:hover,
.play-btn:focus-visible {
  background: #1e5ab8;
}

.info-btn {
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(249, 250, 251, 0.14);
  border: 1px solid rgba(249, 250, 251, 0.24);
  color: var(--color-text);
}

.info-btn:hover,
.info-btn:focus-visible {
  background: rgba(249, 250, 251, 0.24);
}

@media (max-width: 640px) {
  .hero {
    min-height: 340px;
  }

  .title {
    font-size: 1.7rem;
  }
}
</style>
