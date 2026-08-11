export type UpdateWatchingDTO = {
  videoId: number;
  positionSeconds: number;
  /** Best-effort write that must survive the page unloading. */
  keepalive?: boolean;
};
