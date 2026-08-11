<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Movie } from '@domain/entities/movie';
import VideoCard from '@presentation/components/VideoCard.vue';
import Rail from '@presentation/components/Rail.vue';
import { useMovieList } from '@application/usecases/movieUseCases';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';

const router = useRouter();
const { data: continueWatching } = useContinueWatchingQuery();
const { isPending, data, error } = useMovieList();
const movies = computed(() => data.value?.data ?? []);

const continueWatchingMovies = computed<{ movie: Movie; progressPercent: number }[]>(() => {
  const entries = continueWatching.value?.data ?? [];
  return entries
    .map((entry) => {
      const movie = movies.value.find((m) => m.id === entry.video_id);
      return movie ? { movie, progressPercent: entry.progress_percentage } : null;
    })
    .filter((item): item is { movie: Movie; progressPercent: number } => item !== null);
});

const restOfCatalog = computed<Movie[]>(() => {
  const continueWatchingIds = new Set(continueWatchingMovies.value.map((item) => item.movie.id));
  return movies.value.filter((m) => !continueWatchingIds.has(m.id));
});

function progressFor(movieId: number | undefined): number {
  return (
    continueWatchingMovies.value.find((item) => item.movie.id === movieId)?.progressPercent ?? 0
  );
}

function openTitle(id: number): void {
  router.push({ name: 'title', params: { id } });
}

function playMovie(id: number | undefined): void {
  if (id == null) return;
  router.push({ name: 'watch', params: { id } });
}
</script>

<template>
  <div class="home">
    <p v-if="isPending" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>

    <template v-else>
      <Rail v-if="continueWatchingMovies.length" title="ادامه تماشا" hint="روی سرور ذخیره شده">
        <VideoCard
          v-for="item in continueWatchingMovies"
          :key="item.movie.id"
          :movie="item.movie"
          :progress-percent="item.progressPercent"
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
