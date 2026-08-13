import { computed, reactive, readonly } from 'vue';
import type { Session } from '@domain/session';
import { setTokenProvider, setUnauthorizedHandler } from '@infra/api/httpClient';
import { loadStoredSession, persistSession } from '@shared/utils/sessionStorage';

interface AuthState {
  token: string | null;
  identifier: string | null;
  expiresAt: number | null;
}

const session = loadStoredSession();

const state = reactive<AuthState>({
  token: session?.token ?? null,
  identifier: session?.identifier ?? null,
  expiresAt: session?.expiresAt ?? null,
});

const isAuthenticated = computed(() => !!state.token && Date.now() < (state.expiresAt ?? 0));

setTokenProvider(() => state.token);
setUnauthorizedHandler(() => logout());

type LogoutHook = () => void;
const logoutHooks: LogoutHook[] = [];

export function onLogout(hook: LogoutHook): void {
  logoutHooks.push(hook);
}

type BeforeLogoutHook = () => Promise<unknown> | void;
const beforeLogoutHooks: BeforeLogoutHook[] = [];

export function onBeforeLogout(hook: BeforeLogoutHook): () => void {
  beforeLogoutHooks.push(hook);
  return () => {
    const index = beforeLogoutHooks.indexOf(hook);
    if (index !== -1) beforeLogoutHooks.splice(index, 1);
  };
}

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function clearExpiryTimer(): void {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

function scheduleExpiry(): void {
  clearExpiryTimer();
  if (!state.expiresAt) return;
  const msUntilExpiry = state.expiresAt - Date.now();
  if (msUntilExpiry <= 0) {
    logout();
    return;
  }
  expiryTimer = setTimeout(logout, msUntilExpiry);
}

function persist(): void {
  persistSession(
    state.token
      ? { token: state.token, identifier: state.identifier ?? '', expiresAt: state.expiresAt ?? 0 }
      : null
  );
}

function setSession(session: Session): void {
  state.token = session.token;
  state.identifier = session.identifier;
  state.expiresAt = session.expiresAt;
  persist();
  scheduleExpiry();
}

async function logout(): Promise<void> {
  clearExpiryTimer();
  await Promise.all(
    beforeLogoutHooks.map((hook) =>
      Promise.resolve()
        .then(() => hook())
        .catch(() => {})
    )
  );
  state.token = null;
  state.identifier = null;
  state.expiresAt = null;
  persist();
  logoutHooks.forEach((hook) => hook());
}

scheduleExpiry();

export function useAuth() {
  return {
    state: readonly(state),
    isAuthenticated,
    setSession,
    logout,
  };
}
