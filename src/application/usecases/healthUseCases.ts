import { useQuery } from '@tanstack/vue-query';
import { healthRepository } from '@infra/adapters/healthRepositoryImpl';
import { healthKeys } from '@shared/api/queryKeys';

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.status(),
    queryFn: () => healthRepository.getHealth(),
    refetchOnWindowFocus: false,
  });
}
