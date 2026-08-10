<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { listMoviesUseCase } from '@application/usecases/movieUseCases';
import { useWatchStore } from '@infra/storage/watchStore';
import type { Movie } from '@domain/entities/movie';
import type { ApiError } from '@infra/api/httpClient';
import VideoCard from '@presentation/components/VideoCard.vue';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';

const router = useRouter();
const watchStore = useWatchStore();

const movies = ref<Movie[]>([]);
const loading = ref(true);
const error = ref('');

const continueWatchingMovie = computed<Movie | null>(() => {
  const continueWatching = watchStore.continueWatching;
  if (!continueWatching) return null;
  return movies.value.find((m) => m.id === continueWatching.video_id) ?? null;
});

function resume(id: number): void {
  router.push({ name: 'watch', params: { id } });
}

onMounted(async () => {
  try {
    const [moviesRes] = await Promise.all([
      listMoviesUseCase(),
      watchStore.fetchContinueWatching(),
    ]);
    movies.value = moviesRes;
  } catch (err) {
    error.value = (err as Partial<ApiError>).message || 'دریافت اطلاعات با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="continue-page">
    <div class="heading">
      <h1 class="title">ادامه تماشا</h1>
      <p class="subtitle">
        وضعیت تماشای شما روی سرور ذخیره شده است؛ از همان‌جایی که رها کردید ادامه دهید.
      </p>
    </div>

    <p v-if="loading" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>
    <p v-else-if="!continueWatchingMovie" class="status">چیزی برای ادامه تماشا نیست.</p>

    <FocusableGrid v-else>
      <div class="grid">
        <VideoCard
          :movie="continueWatchingMovie"
          :progress-percent="watchStore.continueWatching?.progress_percentage ?? 0"
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
