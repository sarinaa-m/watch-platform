import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { movieListRepository } from '@infra/adapters/movieRepositoryImpl';
import { movieKeys } from '@shared/api/queryKeys';
import { useQuery } from '@tanstack/vue-query';

export const useMovieList = () => {
  return useQuery({
    queryKey: movieKeys.list(),
    queryFn: () => movieListRepository.getMovies(),
  });
};

export const useMovieItem = (id: MaybeRefOrGetter<string | number>) => {
  const movieId = computed(() => toValue(id));
  return useQuery({
    queryKey: computed(() => movieKeys.detail(movieId.value)),
    queryFn: () => movieListRepository.getMovieById(movieId.value),
    enabled: computed(() => !!movieId.value),
  });
};
