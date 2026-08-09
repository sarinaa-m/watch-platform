import type { WatchProgress } from '@domain/entities/watchProgress';

export interface ContinueWatchingResponse {
  data: WatchProgress[];
}

export interface WatchProgressRepository {
  getContinueWatching(token: string): Promise<ContinueWatchingResponse>;
  updateWatchProgress(
    token: string,
    videoId: number,
    positionSeconds: number
  ): Promise<WatchProgress>;
}
