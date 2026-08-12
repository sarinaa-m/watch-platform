<script setup lang="ts">
import type { Movie } from '@domain/movie';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';
import MediaBackdrop from '@presentation/components/MediaBackdrop.vue';
import ProgressBar from '@presentation/components/ProgressBar.vue';
import { usePlaybackStatusLabels } from '@presentation/composables/usePlaybackStatusLabels';

const props = withDefaults(
  defineProps<{
    movie: Movie;
    progressPercent?: number;
    isContinueWatching?: boolean;
  }>(),
  { progressPercent: 0, isContinueWatching: false }
);

defineEmits<{ play: [id: number]; moreInfo: [id: number] }>();

const { playLabel } = usePlaybackStatusLabels(() => props.progressPercent);
</script>

<template>
  <MediaBackdrop :image="movie.cover_image" size="lg">
    <span v-if="isContinueWatching" class="eyebrow">{{ $t('home.continueWatchingTitle') }}</span>
    <h1 class="title">{{ movie.title }}</h1>
    <p class="desc">{{ movie.description }}</p>
    <ProgressBar :percent="progressPercent" />
    <FocusableGrid>
      <div class="hero-actions">
        <button class="focusable play-btn" tabindex="0" @click="$emit('play', movie.id)">
          {{ playLabel }}
        </button>
        <button class="focusable info-btn" tabindex="0" @click="$emit('moreInfo', movie.id)">
          {{ $t('home.moreInfo') }}
        </button>
      </div>
    </FocusableGrid>
  </MediaBackdrop>
</template>

<style scoped>
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
  color: var(--color-text-secondary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  color: var(--color-text);
  border: none;
}

.play-btn:hover,
.play-btn:focus-visible {
  background: var(--color-accent-deep);
}

.info-btn {
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(var(--color-text-rgb), 0.14);
  border: 1px solid rgba(var(--color-text-rgb), 0.24);
  color: var(--color-text);
}

.info-btn:hover,
.info-btn:focus-visible {
  background: rgba(var(--color-text-rgb), 0.24);
}

@media (max-width: 640px) {
  .title {
    font-size: 1.7rem;
  }
}
</style>
