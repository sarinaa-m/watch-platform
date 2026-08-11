<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Movie } from '@domain/entities/movie';
import VideoCard from '@presentation/components/VideoCard.vue';
import Rail from '@presentation/components/Rail.vue';
import QueryState from '@presentation/components/QueryState.vue';
import { useMovieList } from '@application/usecases/movieUseCases';
import { useContinueWatchingMovies } from '@application/usecases/continueWatchingUseCases';

const router = useRouter();
const { isPending, data, error } = useMovieList();
const movies = computed(() => data.value?.data ?? []);

const { items: continueWatchingMovies } = useContinueWatchingMovies();

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
    <QueryState :pending="isPending" :error="error">
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
    </QueryState>
  </div>
</template>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
