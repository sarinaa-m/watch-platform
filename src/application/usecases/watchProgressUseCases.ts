import { watchProgressRepository } from '@infra/adapters/watchProgressRepositoryImpl';

import type { WatchProgress } from '@domain/entities/watchProgress';

export async function fetchContinueWatchingUseCase(): Promise<WatchProgress | null> {
  const res = await watchProgressRepository.getContinueWatching();
  // The spec guarantees 0 or 1 entries, so `total: 0` is a normal empty state.
  return res.data[0] ?? null;
}

export function syncWatchProgressUseCase(
  videoId: number,
  positionSeconds: number,
  keepalive = false
): Promise<WatchProgress> {
  return watchProgressRepository.updateWatchProgress({ videoId, positionSeconds, keepalive });
}
