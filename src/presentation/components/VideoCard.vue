<script setup lang="ts">
import type { Movie } from '@domain/entities/movie';

withDefaults(
  defineProps<{
    movie: Movie;
    progressPercent?: number;
  }>(),
  { progressPercent: 0 }
);
defineEmits<{ select: [id: number] }>();
</script>

<template>
  <button
    class="focusable card"
    tabindex="-1"
    @click="$emit('select', movie.id)"
    @keydown.enter="$emit('select', movie.id)"
  >
    <div class="thumb-wrap">
      <img class="thumb" :src="movie.cover_image" :alt="movie.title" loading="lazy" />
      <div v-if="progressPercent > 0" class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>
    <div class="meta">
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
  text-align: left;
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
  aspect-ratio: 16 / 9;
  background: var(--color-bg-elevated);
  flex: 0 0 auto;
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
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
