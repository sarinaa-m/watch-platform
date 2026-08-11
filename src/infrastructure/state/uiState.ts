import { reactive, readonly } from 'vue';

const STORAGE_KEY = 'arvan_profile_confirmed';

interface UiState {
  profileConfirmed: boolean;
}

const state = reactive<UiState>({
  profileConfirmed: localStorage.getItem(STORAGE_KEY) === '1',
});

function confirm(): void {
  state.profileConfirmed = true;
  localStorage.setItem(STORAGE_KEY, '1');
}

function reset(): void {
  state.profileConfirmed = false;
  localStorage.removeItem(STORAGE_KEY);
}

export function useUiState() {
  return {
    state: readonly(state),
    confirm,
    reset,
  };
}
