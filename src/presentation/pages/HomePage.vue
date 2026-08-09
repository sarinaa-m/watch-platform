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

function progressFor(movieId: number): number {
  if (watchStore.continueWatching?.video_id === movieId) {
    return watchStore.continueWatching.progress_percentage;
  }
  return 0;
}

function openMovie(id: number): void {
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
    error.value = (err as Partial<ApiError>).message || 'دریافت لیست ویدیوها با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home">
    <section v-if="continueWatchingMovie" class="continue-section">
      <h2 class="section-title">ادامه تماشا</h2>
      <FocusableGrid>
        <div class="continue-row">
          <VideoCard
            :movie="continueWatchingMovie"
            :progress-percent="watchStore.continueWatching?.progress_percentage ?? 0"
            @select="openMovie"
          />
        </div>
      </FocusableGrid>
    </section>

    <section>
      <h2 class="section-title">همه ویدیوها</h2>

      <p v-if="loading" class="status">در حال بارگذاری...</p>
      <p v-else-if="error" class="status error">{{ error }}</p>

      <FocusableGrid v-else>
        <div class="grid">
          <VideoCard
            v-for="movie in movies"
            :key="movie.id"
            :movie="movie"
            :progress-percent="progressFor(movie.id)"
            @select="openMovie"
          />
        </div>
      </FocusableGrid>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: var(--space-3);
}

.continue-row {
  max-width: 360px;
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
  color: var(--color-pink);
}
</style>
