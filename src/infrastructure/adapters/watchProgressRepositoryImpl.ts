import { httpClient } from '@infra/api/httpClient';
import type { ContinueWatchingResponse, WatchProgress } from '@domain/entities';
import type { WatchProgressRepository, UpdateWatchingDTO } from '@domain/ports';

export const createWatchProgressRepository = (): WatchProgressRepository => ({
  async getContinueWatching(token: string): Promise<ContinueWatchingResponse> {
    return httpClient.get<ContinueWatchingResponse>('/continue-watching', { token });
  },
  async updateWatchProgress(dto: UpdateWatchingDTO): Promise<WatchProgress> {
    const { positionSeconds, token, videoId } = dto;
    return httpClient.put<WatchProgress>(
      '/watch-progress',
      { video_id: videoId, position_seconds: positionSeconds },
      { token }
    );
  },
});

export const watchProgressRepository = createWatchProgressRepository();
