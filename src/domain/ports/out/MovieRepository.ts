import type { Movie } from '@domain/entities/movie';

export interface MovieListResponse {
  data: Movie[];
  total: number;
}

export interface MovieRepository {
  getMovies(): Promise<MovieListResponse>;
  getMovieById(id: number | string): Promise<Movie>;
}
