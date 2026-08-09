import { defineStore } from 'pinia';
import {
  fetchContinueWatchingUseCase,
  syncWatchProgressUseCase,
} from '@application/usecases/watchProgressUseCases';
import { useAuthStore } from '@infra/storage/authStore';
import type { WatchProgress } from '@domain/entities/watchProgress';

interface WatchState {
  continueWatching: WatchProgress | null;
  loading: boolean;
}

export const useWatchStore = defineStore('watch', {
  state: (): WatchState => ({
    continueWatching: null,
    loading: false,
  }),

  actions: {
    async fetchContinueWatching(): Promise<void> {
      const auth = useAuthStore();
      this.loading = true;
      try {
        this.continueWatching = await fetchContinueWatchingUseCase(auth.token ?? '');
      } finally {
        this.loading = false;
      }
    },

    // Fire-and-forget style sync; callers can await if they need to know
    // it landed (e.g. before navigating away), but normal periodic calls
    // shouldn't block the player.
    async syncProgress(
      videoId: number,
      positionSeconds: number
    ): Promise<WatchProgress | undefined> {
      const auth = useAuthStore();
      if (!auth.token) return;
      const res = await syncWatchProgressUseCase(auth.token, videoId, positionSeconds);
      this.continueWatching = res;
      return res;
    },
  },
});
