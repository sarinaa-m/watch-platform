import { computed } from 'vue';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';
import { useMovieList } from '@application/usecases/movieUseCases';
import type { Movie } from '@domain/movie';

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
    const entry = continueWatching.value;
    if (!entry) return [];
    const movie = movies.value.find((m) => m.id === entry.video_id);
    return movie ? [{ movie, progressPercent: entry.progress_percentage }] : [];
  });

  const restOfCatalog = computed<Movie[]>(() => {
    const currentId = items.value?.[0]?.movie.id;
    return movies.value.filter((m) => m.id !== currentId);
  });

  function progressFor(movieId: number | undefined): number {
    return items.value.find((item) => item.movie.id === movieId)?.progressPercent ?? 0;
  }

  return { items, restOfCatalog, progressFor, isPending, error };
}
