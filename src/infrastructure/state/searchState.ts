import { reactive, readonly } from 'vue';
import type { Movie } from '@domain/movie';

const state = reactive<{ query: string }>({ query: '' });

function setQuery(query: string): void {
  state.query = query;
}

export function useSearch() {
  return {
    state: readonly(state),
    setQuery,
  };
}

export function filterMoviesByQuery(movies: Movie[], query: string): Movie[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return movies;
  return movies.filter((movie) => movie.title.toLocaleLowerCase().includes(q));
}
