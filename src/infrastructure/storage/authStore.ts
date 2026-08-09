import { defineStore } from 'pinia';
import {
  requestOtpUseCase,
  verifyOtpUseCase,
  fetchCurrentUserUseCase,
} from '@application/usecases/authUseCases';
import { loadStoredSession, persistSession } from '@shared/utils/sessionStorage';

interface AuthState {
  token: string | null;
  identifier: string | null;
  expiresAt: number | null;
  pendingIdentifier: string | null; // set after request-otp, used on the verify step
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const session = loadStoredSession();
    return {
      token: session?.token ?? null,
      identifier: session?.identifier ?? null,
      expiresAt: session?.expiresAt ?? null,
      pendingIdentifier: null,
    };
  },

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    persist(): void {
      persistSession(
        this.token
          ? { token: this.token, identifier: this.identifier ?? '', expiresAt: this.expiresAt ?? 0 }
          : null
      );
    },

    async requestOtp(identifier: string): Promise<void> {
      await requestOtpUseCase(identifier);
      this.pendingIdentifier = identifier;
    },

    async verifyOtp(otp: string): Promise<void> {
      const identifier = this.pendingIdentifier ?? '';
      const session = await verifyOtpUseCase(identifier, otp);
      this.token = session.token;
      this.identifier = session.identifier;
      this.expiresAt = session.expiresAt;
      this.pendingIdentifier = null;
      this.persist();
    },

    async fetchCurrentUser(): Promise<void> {
      if (!this.token) return;
      this.identifier = await fetchCurrentUserUseCase(this.token);
      this.persist();
    },

    logout(): void {
      this.token = null;
      this.identifier = null;
      this.expiresAt = null;
      this.persist();
    },
  },
});
