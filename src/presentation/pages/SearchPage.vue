<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Movie } from '@domain/entities/movie';
import VideoCard from '@presentation/components/VideoCard.vue';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';
import QueryState from '@presentation/components/QueryState.vue';
import { useMovieList } from '@application/usecases/movieUseCases';

const router = useRouter();
const query = ref('');

const { data, isPending, error } = useMovieList();

const movies = computed(() => data.value?.data ?? []);

const results = computed<Movie[]>(() => {
  const q = query.value.trim().toLocaleLowerCase();
  if (!q) return movies.value ?? [];
  return movies.value?.filter((m) => m.title.includes(q)) ?? [];
});

function openTitle(id: number): void {
  router.push({ name: 'title', params: { id } });
}
</script>

<template>
  <div class="search-page">
    <div class="search-box">
      <input
        v-model="query"
        class="focusable search-input"
        type="text"
        :placeholder="$t('search.placeholder')"
      />
    </div>

    <QueryState :pending="isPending" :error="error">
      <p class="results-label">
        <template v-if="query">{{ $t('search.queryPrefix', { query }) }}</template
        >{{ $t('search.resultsCount', { count: results.length }) }}
      </p>
      <FocusableGrid>
        <div class="grid">
          <VideoCard v-for="movie in results" :key="movie.id" :movie="movie" @select="openTitle" />
        </div>
      </FocusableGrid>
    </QueryState>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-box {
  max-width: 640px;
  margin-bottom: var(--space-4);
}

.search-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 1.05rem;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
}

.search-input:focus-visible {
  border-color: var(--color-focus);
}

.results-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
</style>
