export interface WatchProgress {
  video_id: number;
  position_seconds: number;
  progress_percentage: number;
  updated_at: string;
  completed: boolean;
}

export interface ContinueWatchingResponse {
  data: WatchProgress[];
  total: number;
}

export type UpdateWatchingDTO = {
  videoId: number;
  positionSeconds: number;
  keepalive?: boolean;
};
