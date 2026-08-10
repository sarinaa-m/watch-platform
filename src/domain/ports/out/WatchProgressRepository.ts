import type { ContinueWatchingResponse, WatchProgress } from '@domain/entities';
import type { UpdateWatchingDTO } from '../dto';

export interface WatchProgressRepository {
  getContinueWatching(token: string): Promise<ContinueWatchingResponse>;
  updateWatchProgress(dto: UpdateWatchingDTO): Promise<WatchProgress>;
}
