<script setup lang="ts">
import { computed } from 'vue';
import type { Movie } from '@domain/entities/movie';

const props = withDefaults(
  defineProps<{
    movie: Movie;
    progressPercent?: number;
  }>(),
  { progressPercent: 0 }
);
defineEmits<{ play: []; info: [] }>();

const playLabel = computed(() =>
  props.progressPercent > 2 ? `▶ ادامه از ${Math.round(props.progressPercent)}٪` : '▶ شروع تماشا'
);
</script>

<template>
  <div class="hero" :style="{ backgroundImage: `url(${movie.cover_image})` }">
    <div class="scrim" />
    <div class="content">
      <h1 class="title">{{ movie.title }}</h1>
      <p class="desc">{{ movie.description }}</p>
      <div class="actions">
        <button class="focusable btn btn-primary" tabindex="0" @click="$emit('play')">
          {{ playLabel }}
        </button>
        <button class="focusable btn btn-ghost" tabindex="0" @click="$emit('info')">جزئیات</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  min-height: 340px;
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
    to left,
    rgba(8, 13, 21, 0.15) 0%,
    rgba(8, 13, 21, 0.78) 55%,
    rgba(8, 13, 21, 0.96) 100%
  );
}

.content {
  position: relative;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 560px;
}

.title {
  font-size: 2rem;
  line-height: 1.25;
}

.desc {
  color: #d1d5db;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
}

.btn-primary:hover,
.btn-primary:focus-visible {
  background: #1e5ab8;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-ghost:hover,
.btn-ghost:focus-visible {
  background: rgba(255, 255, 255, 0.14);
}
</style>
