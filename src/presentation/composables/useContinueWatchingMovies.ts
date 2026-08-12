import { computed } from 'vue';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';
import { useMovieList } from '@application/usecases/movieUseCases';
import type { Movie } from '@domain/entities/movie';

export interface ContinueWatchingMovie {
  movie: Movie;
  progressPercent: number;
}

export function useContinueWatchingMovies() {
  const {
    data: continueWatching,
    isPending: continueWatchingPending,
    error: continueWatchingError,
  } = useContinueWatchingQuery();
  const { data: movieList, isPending: moviesPending, error: moviesError } = useMovieList();

  const movies = computed(() => movieList.value?.data ?? []);
  const isPending = computed(() => continueWatchingPending.value || moviesPending.value);
  const error = computed(() => continueWatchingError.value ?? moviesError.value);

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
