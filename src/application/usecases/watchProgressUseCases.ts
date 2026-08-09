import {
  getContinueWatching,
  updateWatchProgress,
} from '@infra/adapters/watchProgressRepositoryImpl';
import type { WatchProgress } from '@domain/entities/watchProgress';

export async function fetchContinueWatchingUseCase(token: string): Promise<WatchProgress | null> {
  const res = await getContinueWatching(token);
  return res.data[0] ?? null;
}

export function syncWatchProgressUseCase(
  token: string,
  videoId: number,
  positionSeconds: number
): Promise<WatchProgress> {
  return updateWatchProgress(token, videoId, positionSeconds);
}
