<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { listMoviesUseCase } from '@application/usecases/movieUseCases';
import { useWatchStore } from '@infra/storage/watchStore';
import type { Movie } from '@domain/entities/movie';
import type { ApiError } from '@infra/api/httpClient';
import VideoCard from '@presentation/components/VideoCard.vue';
import HeroBanner from '@presentation/components/HeroBanner.vue';
import Rail from '@presentation/components/Rail.vue';

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

const heroMovie = computed<Movie | null>(
  () => continueWatchingMovie.value ?? movies.value[0] ?? null
);
const heroProgress = computed(() => watchStore.continueWatching?.progress_percentage ?? 0);

const restOfCatalog = computed<Movie[]>(() =>
  movies.value.filter((m) => m.id !== continueWatchingMovie.value?.id)
);

function progressFor(movieId: number): number {
  if (watchStore.continueWatching?.video_id === movieId) {
    return watchStore.continueWatching.progress_percentage;
  }
  return 0;
}

function openTitle(id: number): void {
  router.push({ name: 'title', params: { id } });
}

function playMovie(id: number | undefined): void {
  if (id == null) return;
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
    <p v-if="loading" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else>
      <HeroBanner
        v-if="heroMovie"
        :movie="heroMovie"
        :progress-percent="heroProgress"
        @play="playMovie(heroMovie?.id)"
        @info="openTitle(heroMovie!.id)"
      />

      <Rail v-if="continueWatchingMovie" title="ادامه تماشا" hint="روی سرور ذخیره شده">
        <VideoCard
          :movie="continueWatchingMovie"
          :progress-percent="watchStore.continueWatching?.progress_percentage ?? 0"
          @select="playMovie"
        />
      </Rail>

      <Rail title="همه ویدیوها" hint="فهرست کامل دوره‌ها">
        <VideoCard
          v-for="movie in restOfCatalog"
          :key="movie.id"
          :movie="movie"
          :progress-percent="progressFor(movie.id)"
          @select="openTitle"
        />
      </Rail>
    </template>
  </div>
</template>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
}

.status {
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}
</style>
