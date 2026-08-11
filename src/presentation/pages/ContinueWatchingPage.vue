<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContinueWatchingQuery } from '@infra/query/useWatchProgressQuery';
import type { Movie } from '@domain/entities/movie';
import VideoCard from '@presentation/components/VideoCard.vue';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';
import { useMovieList } from '@application/usecases/movieUseCases';

const router = useRouter();
const { continueWatching } = useContinueWatchingQuery();
const { data, isPending, error } = useMovieList();

const movies = computed(() => data.value?.data ?? []);

const continueWatchingMovie = computed<Movie | null>(() => {
  if (!continueWatching.value) return null;
  return movies.value?.find((m) => m.id === continueWatching.value?.video_id) ?? null;
});

function resume(id: number): void {
  router.push({ name: 'watch', params: { id } });
}
</script>

<template>
  <div class="continue-page">
    <div class="heading">
      <h1 class="title">ادامه تماشا</h1>
      <p class="subtitle">
        وضعیت تماشای شما روی سرور ذخیره شده است؛ از همان‌جایی که رها کردید ادامه دهید.
      </p>
    </div>

    <p v-if="isPending" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>
    <p v-else-if="!continueWatchingMovie" class="status">چیزی برای ادامه تماشا نیست.</p>

    <FocusableGrid v-else>
      <div class="grid">
        <VideoCard
          :movie="continueWatchingMovie"
          :progress-percent="continueWatching?.progress_percentage ?? 0"
          @select="resume"
        />
      </div>
    </FocusableGrid>
  </div>
</template>

<style scoped>
.continue-page {
  max-width: 1200px;
  margin: 0 auto;
}

.heading {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.status {
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}
</style>
