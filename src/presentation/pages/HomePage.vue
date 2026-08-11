<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContinueWatchingQuery } from '@infra/query/useWatchProgressQuery';
import type { Movie } from '@domain/entities/movie';
import VideoCard from '@presentation/components/VideoCard.vue';
import HeroBanner from '@presentation/components/HeroBanner.vue';
import Rail from '@presentation/components/Rail.vue';
import { useMovieList } from '@application/usecases/movieUseCases';

const router = useRouter();
const { continueWatching } = useContinueWatchingQuery();
const { isPending, data, error } = useMovieList();
const movies = computed(() => data.value?.data ?? []);

const continueWatchingMovie = computed<Movie | null>(() => {
  if (!continueWatching.value) return null;
  return movies.value.find((m) => m.id === continueWatching.value?.video_id) ?? null;
});

const heroMovie = computed<Movie | null>(
  () => continueWatchingMovie.value ?? movies.value[0] ?? null
);
const heroProgress = computed(() => continueWatching.value?.progress_percentage ?? 0);

const restOfCatalog = computed<Movie[]>(() =>
  movies.value.filter((m) => m.id !== continueWatchingMovie.value?.id)
);

function progressFor(movieId: number): number {
  if (continueWatching.value?.video_id === movieId) {
    return continueWatching.value.progress_percentage;
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
</script>

<template>
  <div class="home">
    <p v-if="isPending" class="status">در حال بارگذاری...</p>
    <p v-else-if="error" class="status error">{{ error.message }}</p>

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
          :progress-percent="continueWatching?.progress_percentage ?? 0"
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
