import type { Movie, MovieListResponse } from '@domain/entities';

export interface MovieRepository {
  getMovies(): Promise<MovieListResponse>;
  getMovieById(id: number | string): Promise<Movie>;
}
