import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { movieListRepository } from '@infra/adapters/movieRepositoryImpl';
import { movieKeys } from '@shared/api/queryKeys';
import { useQuery } from '@tanstack/vue-query';
import type { Movie } from '@domain/entities/movie';

export const useMovieList = () => {
  return useQuery({
    queryKey: movieKeys.all,
    queryFn: () => movieListRepository.getMovies(),
  });
};

/**
 * `id` is accepted as a ref/getter so the query key tracks it. Route params
 * change without remounting the page component, so a plain value would pin
 * the query to whichever id happened to be set at setup time.
 */
export const useMovieItem = (id: MaybeRefOrGetter<string | number>) => {
  const movieId = computed(() => toValue(id));

  const query = useQuery({
    queryKey: computed(() => movieKeys.detail(movieId.value)),
    queryFn: () => movieListRepository.getMovieById(movieId.value),
    enabled: computed(() => !!movieId.value),
  });

  return {
    movie: computed<Movie | null>(() => query.data.value ?? null),
    isPending: query.isPending,
    error: query.error,
  };
};
