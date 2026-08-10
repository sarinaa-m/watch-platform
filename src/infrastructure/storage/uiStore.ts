import { defineStore } from 'pinia';

// Pure UI-navigation state (which profile tile the "who's watching" screen
// gate has been passed for) - not part of the auth Session domain entity,
// since it carries no auth meaning of its own.
const STORAGE_KEY = 'arvan_profile_confirmed';

interface UiState {
  profileConfirmed: boolean;
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    profileConfirmed: localStorage.getItem(STORAGE_KEY) === '1',
  }),

  actions: {
    confirm(): void {
      this.profileConfirmed = true;
      localStorage.setItem(STORAGE_KEY, '1');
    },

    reset(): void {
      this.profileConfirmed = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});
