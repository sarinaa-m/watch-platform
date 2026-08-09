import { httpClient } from '@infra/api/httpClient';
import type { Movie } from '@domain/entities/movie';
import type { MovieListResponse } from '@domain/ports/out/MovieRepository';

// GET /movies - public, returns { data: Movie[], total }
export function getMovies(): Promise<MovieListResponse> {
  return httpClient.get<MovieListResponse>('/movies');
}

// GET /movies/{id} - public
export function getMovieById(id: number | string): Promise<Movie> {
  return httpClient.get<Movie>(`/movies/${id}`);
}
