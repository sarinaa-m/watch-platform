import { httpClient } from '@infra/api/httpClient';
import type { WatchProgress } from '@domain/entities/watchProgress';
import type { ContinueWatchingResponse } from '@domain/ports/out/WatchProgressRepository';

// GET /continue-watching - always returns exactly one item for the user
export function getContinueWatching(token: string): Promise<ContinueWatchingResponse> {
  return httpClient.get<ContinueWatchingResponse>('/continue-watching', { token });
}

// PUT /watch-progress - call periodically, on pause, and on page leave
export function updateWatchProgress(
  token: string,
  videoId: number,
  positionSeconds: number
): Promise<WatchProgress> {
  return httpClient.put<WatchProgress>(
    '/watch-progress',
    { video_id: videoId, position_seconds: positionSeconds },
    { token }
  );
}
