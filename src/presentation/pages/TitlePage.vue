<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieItem } from '@application/usecases/movieUseCases';
import { usePlaybackStatusLabels } from '@presentation/composables/usePlaybackStatusLabels';
import { useVideoProgress } from '@presentation/composables/useVideoProgress';
import MediaBackdrop from '@presentation/components/MediaBackdrop.vue';
import ProgressBar from '@presentation/components/ProgressBar.vue';
import QueryState from '@presentation/components/QueryState.vue';
import TitlePageSkeleton from '@presentation/components/skeletons/TitlePageSkeleton.vue';

const props = defineProps<{ id: string | number }>();

const router = useRouter();
const progress = useVideoProgress(() => Number(props.id));
const progressPercent = computed(() => progress.value.progressPercent);
const { statusLabel, playLabel } = usePlaybackStatusLabels(progressPercent);

function play(): void {
  router.push({ name: 'watch', params: { id: props.id } });
}

const { data: movie, isPending, error } = useMovieItem(() => Number(props.id));
</script>

<template>
  <div class="title-page">
    <button class="focusable back-btn" tabindex="0" @click="router.push({ name: 'home' })">
      → {{ $t('common.back') }}
    </button>

    <QueryState :pending="isPending" :error="error">
      <template #skeleton>
        <TitlePageSkeleton />
      </template>

      <template v-if="movie">
        <MediaBackdrop :image="movie.cover_image" size="md">
          <h1 class="title">{{ movie.title }}</h1>
          <p class="desc">{{ movie.description }}</p>
          <button class="focusable play-btn" tabindex="0" @click="play">{{ playLabel }}</button>
        </MediaBackdrop>

        <div class="episodes">
          <h2 class="section-title">{{ $t('title.episodes') }}</h2>
          <div class="episode-row focusable" tabindex="0" @click="play" @keydown.enter="play">
            <div class="episode-num">1</div>
            <div class="episode-thumb" :style="{ backgroundImage: `url(${movie.cover_image})` }">
              <div class="thumb-progress">
                <ProgressBar :percent="progressPercent" :rounded="false" />
              </div>
            </div>
            <div class="episode-meta">
              <div class="episode-title">{{ movie.title }}</div>
              <div class="episode-status">{{ statusLabel }}</div>
            </div>
          </div>
        </div>
      </template>
    </QueryState>
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
  background: rgba(var(--color-text-rgb), 0.08);
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

.title {
  font-size: 1.9rem;
  line-height: 1.25;
}

.desc {
  color: var(--color-text-secondary);
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
  color: var(--color-text);
  border: none;
}

.play-btn:hover,
.play-btn:focus-visible {
  background: var(--color-accent-deep);
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
  background: rgba(var(--color-text-rgb), 0.035);
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.episode-row:hover,
.episode-row:focus-visible {
  background: rgba(var(--color-accent-rgb), 0.12);
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

.thumb-progress {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
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
</style>
