<script setup lang="ts">
import type { Movie } from '@domain/movie';
import ProgressBar from '@presentation/components/ProgressBar.vue';

withDefaults(
  defineProps<{
    movie: Movie;
    progressPercent?: number;
    variant?: 'rail' | 'poster';
  }>(),
  { progressPercent: 0, variant: 'rail' }
);
defineEmits<{ select: [id: number] }>();
</script>

<template>
  <button
    class="focusable card"
    :class="`card--${variant}`"
    tabindex="-1"
    @click="$emit('select', movie.id)"
    @keydown.enter="$emit('select', movie.id)"
  >
    <div class="thumb-wrap">
      <img class="thumb" :src="movie.cover_image" :alt="movie.title" loading="lazy" />
      <span class="hover-play" aria-hidden="true">▶</span>
      <div class="thumb-progress">
        <ProgressBar :percent="progressPercent" :rounded="false" track-color="rgba(0, 0, 0, 0.4)" />
      </div>
      <div v-if="variant === 'poster'" class="poster-overlay">
        <h3 class="poster-title">{{ movie.title }}</h3>
      </div>
    </div>
    <div v-if="variant !== 'poster'" class="meta">
      <h3 class="card-title">{{ movie.title }}</h3>
      <p class="card-desc">{{ movie.description }}</p>
    </div>
  </button>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: start;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  color: inherit;
  width: 100%;
  height: 100%;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.card:hover,
.card:focus-visible {
  transform: translateY(-4px);
  border-color: var(--color-accent-strong);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
}

.thumb-wrap {
  position: relative;
  aspect-ratio: var(--card-aspect-rail);
  background: var(--color-bg-elevated);
  flex: 0 0 auto;
}

.card--poster .thumb-wrap {
  aspect-ratio: var(--card-aspect-poster);
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.card--poster .thumb {
  object-position: center;
}

.hover-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #fff;
  background: rgba(11, 17, 28, 0.35);
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.card:hover .hover-play,
.card:focus-visible .hover-play {
  opacity: 1;
}

.poster-overlay {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--space-2) var(--space-3);
  background: linear-gradient(to top, rgba(11, 17, 28, 0.92), rgba(11, 17, 28, 0));
  opacity: 0;
  transition: opacity 0.15s ease;
}

.card:hover .poster-overlay,
.card:focus-visible .poster-overlay {
  opacity: 1;
}

.poster-title {
  font-size: 0.9rem;
  line-height: 1.3;
}

.thumb-progress {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
}

.meta {
  padding: var(--space-3);
  flex: 1 1 auto;
  min-height: 0;
}

.card-title {
  font-size: 1rem;
  margin-bottom: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
