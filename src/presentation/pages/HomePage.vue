<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import VideoCard from '@presentation/components/VideoCard.vue';
import Rail from '@presentation/components/Rail.vue';
import HeroBanner from '@presentation/components/HeroBanner.vue';
import QueryState from '@presentation/components/QueryState.vue';
import RailSkeleton from '@presentation/components/skeletons/RailSkeleton.vue';
import CardGridSkeleton from '@presentation/components/skeletons/CardGridSkeleton.vue';
import HeroBannerSkeleton from '@presentation/components/skeletons/HeroBannerSkeleton.vue';
import { useMovieList } from '@application/usecases/movieUseCases';
import { useContinueWatchingMovies } from '@application/usecases/continueWatchingUseCases';
import { useSearch } from '@infra/state/searchState';

const router = useRouter();
const { t } = useI18n();
const search = useSearch();
const { data, isPending, error } = useMovieList();
const { items: continueWatchingMovies, restOfCatalog, progressFor } = useContinueWatchingMovies();

const movies = computed(() => data.value?.data ?? []);
const featured = computed(() => continueWatchingMovies.value[0]?.movie ?? movies.value[0]);
const featuredProgress = computed(() => progressFor(featured.value?.id));
const isFeaturedContinueWatching = computed(() => continueWatchingMovies.value.length > 0);

const searchQuery = computed(() => search.state.query.trim());
const filteredCatalog = computed(() => {
  const q = searchQuery.value.toLocaleLowerCase();
  if (!q) return restOfCatalog.value;
  return restOfCatalog.value.filter((movie) => movie.title.toLocaleLowerCase().includes(q));
});
const myListHint = computed(() =>
  searchQuery.value
    ? t('search.resultsCount', { count: filteredCatalog.value.length })
    : t('home.myListHint')
);

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
      <template #skeleton>
        <HeroBannerSkeleton />
        <RailSkeleton />
        <CardGridSkeleton variant="poster" :count="10" />
      </template>

      <HeroBanner
        v-if="featured"
        :movie="featured"
        :progress-percent="featuredProgress"
        :is-continue-watching="isFeaturedContinueWatching"
      />
      <p v-else class="status">{{ $t('home.emptyCatalog') }}</p>

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

      <Rail :title="$t('home.myListTitle')" :hint="myListHint" layout="grid">
        <VideoCard
          v-for="movie in filteredCatalog"
          :key="movie.id"
          :movie="movie"
          variant="poster"
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

.status {
  color: var(--color-text-muted);
}
</style>
