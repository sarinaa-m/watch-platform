import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearch } from '@infra/state/searchState';

export function useTopbarSearch() {
  const route = useRoute();
  const router = useRouter();
  const search = useSearch();
  const query = ref(search.state.query);

  watch(query, (value) => {
    search.setQuery(value);
    if (value.trim() && route.name !== 'home') {
      router.push({ name: 'home' });
    }
  });

  return query;
}
