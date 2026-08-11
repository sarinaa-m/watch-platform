import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  fetchContinueWatchingUseCase,
  syncWatchProgressUseCase,
} from '@application/usecases/watchProgressUseCases';
import { useAuth } from '@infra/state/authState';
import { isFatalApiError } from '@infra/api/httpClient';
import type { WatchProgress } from '@domain/entities/watchProgress';

export const CONTINUE_WATCHING_KEY = ['continue-watching'] as const;

/**
 * Continue-watching is server state, so vue-query owns it: one cache, one
 * loading flag, no hand-rolled mirror that can drift from the query cache.
 */
export function useContinueWatchingQuery() {
  const auth = useAuth();

  const query = useQuery({
    queryKey: CONTINUE_WATCHING_KEY,
    queryFn: fetchContinueWatchingUseCase,
    // The endpoint is bearer-protected; don't fire it while logged out.
    enabled: computed(() => auth.isAuthenticated.value),
    // A 4xx can't be fixed by retrying the identical request.
    retry: (failureCount, error) => !isFatalApiError(error) && failureCount < 1,
  });

  return {
    continueWatching: computed<WatchProgress | null>(() => query.data.value ?? null),
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Writes progress and seeds the cache with the server's response, so the
 * `completed` / `progress_percentage` values shown are always the server's
 * rather than a client-side guess.
 */
export function useSyncProgressMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { videoId: number; positionSeconds: number; keepalive?: boolean }) =>
      syncWatchProgressUseCase(vars.videoId, vars.positionSeconds, vars.keepalive),
    onSuccess: (data) => {
      queryClient.setQueryData(CONTINUE_WATCHING_KEY, data);
    },
    retry: false,
  });

  return mutation;
}
