import { httpClient } from '@infra/api/httpClient';
import type { ContinueWatchingResponse, WatchProgress } from '@domain/entities';
import type { WatchProgressRepository, UpdateWatchingDTO } from '@domain/ports';

export const createWatchProgressRepository = (): WatchProgressRepository => ({
  async getContinueWatching(): Promise<ContinueWatchingResponse> {
    return httpClient.get<ContinueWatchingResponse>('/continue-watching');
  },
  async updateWatchProgress(dto: UpdateWatchingDTO): Promise<WatchProgress> {
    const { positionSeconds, videoId, keepalive } = dto;
    return httpClient.put<WatchProgress>(
      '/watch-progress',
      { video_id: videoId, position_seconds: positionSeconds },
      { keepalive }
    );
  },
});

export const watchProgressRepository = createWatchProgressRepository();
