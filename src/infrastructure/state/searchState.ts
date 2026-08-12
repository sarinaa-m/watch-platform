import { reactive, readonly } from 'vue';

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
