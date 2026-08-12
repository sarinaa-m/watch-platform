import { httpClient } from '@infra/api/httpClient';
import type { Movie, MovieListResponse } from '@domain/entities/movie';

export const createMovieListRepository = () => ({
  async getMovies(): Promise<MovieListResponse> {
    return httpClient.get<MovieListResponse>('/movies');
  },
  async getMovieById(id: number | string): Promise<Movie> {
    return httpClient.get<Movie>(`/movies/${id}`);
  },
});

export const movieListRepository = createMovieListRepository();
