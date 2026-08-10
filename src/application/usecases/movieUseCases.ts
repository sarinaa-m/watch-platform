import type { Movie } from '@domain/entities/movie';
import { movieListRepository } from '@infra/adapters/movieRepositoryImpl';

export async function listMoviesUseCase(): Promise<Movie[]> {
  const res = await movieListRepository.getMovies();
  return res.data;
}

export function getMovieUseCase(id: number | string): Promise<Movie> {
  return movieListRepository.getMovieById(id);
}
