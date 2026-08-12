<script setup lang="ts">
import { useRouter } from 'vue-router';
import VideoCard from '@presentation/components/VideoCard.vue';
import Rail from '@presentation/components/Rail.vue';
import QueryState from '@presentation/components/QueryState.vue';
import { useMovieList } from '@application/usecases/movieUseCases';
import { useContinueWatchingMovies } from '@application/usecases/continueWatchingUseCases';

const router = useRouter();
const { isPending, error } = useMovieList();
const { items: continueWatchingMovies, restOfCatalog, progressFor } = useContinueWatchingMovies();

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
      <Rail
        v-if="continueWatchingMovies.length"
        :title="$t('home.continueWatchingTitle')"
        :hint="$t('home.continueWatchingHint')"
      >
        <VideoCard
          v-for="item in continueWatchingMovies"
          :key="item.movie.id"
          :movie="item.movie"
          :progress-percent="item.progressPercent"
          @select="playMovie"
        />
      </Rail>

      <Rail :title="$t('home.allVideosTitle')" :hint="$t('home.allVideosHint')">
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
