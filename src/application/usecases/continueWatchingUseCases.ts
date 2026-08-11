import { computed } from 'vue';
import { useMovieList } from '@application/usecases/movieUseCases';
import { useContinueWatchingQuery } from '@application/usecases/watchProgressUseCases';
import type { Movie } from '@domain/entities/movie';

export interface ContinueWatchingMovie {
  movie: Movie;
  progressPercent: number;
}

export function useContinueWatchingMovies() {
  const { data: continueWatching, isPending, error } = useContinueWatchingQuery();
  const { data: movieList } = useMovieList();
  const movies = computed(() => movieList.value?.data ?? []);

  const items = computed<ContinueWatchingMovie[]>(() => {
    const entries = continueWatching.value?.data ?? [];
    return entries
      .map((entry) => {
        const movie = movies.value.find((m) => m.id === entry.video_id);
        return movie ? { movie, progressPercent: entry.progress_percentage } : null;
      })
      .filter((item): item is ContinueWatchingMovie => item !== null);
  });

  return { items, isPending, error };
}
