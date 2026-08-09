import { getMovies, getMovieById } from '@infra/adapters/movieRepositoryImpl';
import type { Movie } from '@domain/entities/movie';

export async function listMoviesUseCase(): Promise<Movie[]> {
  const res = await getMovies();
  return res.data;
}

export function getMovieUseCase(id: number | string): Promise<Movie> {
  return getMovieById(id);
}
