import { computed } from 'vue';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';
import type { Movie, MovieListResponse } from '@domain/entities/movie';
import { queryClient } from '@infra/query/queryClient';
import { movieKeys } from '@shared/api/queryKeys';

export interface ContinueWatchingMovie {
  movie: Movie;
  progressPercent: number;
}

export function useContinueWatchingMovies() {
  const { data: continueWatching, isPending, error } = useContinueWatchingQuery();
  const movieListDate = queryClient.getQueryData<MovieListResponse>(movieKeys.list());
  const movies = computed(() => movieListDate?.data ?? []);

  const items = computed<ContinueWatchingMovie[]>(() => {
    const entries = continueWatching.value?.data ?? [];
    return entries
      .map((entry) => {
        const movie = movies.value.find((m) => m.id === entry.video_id);
        return movie ? { movie, progressPercent: entry.progress_percentage } : null;
      })
      .filter((item): item is ContinueWatchingMovie => item !== null);
  });

  const restOfCatalog = computed<Movie[]>(() => {
    const continueWatchingIds = new Set(items.value.map((item) => item.movie.id));
    return movies.value.filter((m) => !continueWatchingIds.has(m.id));
  });

  function progressFor(movieId: number | undefined): number {
    return items.value.find((item) => item.movie.id === movieId)?.progressPercent ?? 0;
  }

  return { items, restOfCatalog, progressFor, isPending, error };
}
