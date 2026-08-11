import { computed, reactive, readonly } from 'vue';
import {
  requestOtpUseCase,
  verifyOtpUseCase,
  fetchCurrentUserUseCase,
} from '@application/usecases/authUseCases';
import { setTokenProvider } from '@infra/api/httpClient';
import { loadStoredSession, persistSession } from '@shared/utils/sessionStorage';

interface AuthState {
  token: string | null;
  identifier: string | null;
  expiresAt: number | null;
  pendingIdentifier: string | null;
}

const session = loadStoredSession();

const state = reactive<AuthState>({
  token: session?.token ?? null,
  identifier: session?.identifier ?? null,
  expiresAt: session?.expiresAt ?? null,
  pendingIdentifier: null,
});

/**
 * Presence of a token is not enough: the API issues 1-hour JWTs with no
 * refresh token, so a stored-but-expired token would pass a `!!token`
 * guard, mount the protected page, then 401 — a visible flash before the
 * redirect. Checking expiry here keeps the guard honest.
 */
const isAuthenticated = computed(() => !!state.token && Date.now() < (state.expiresAt ?? 0));

// The http client pulls the token from here rather than receiving it as an
// argument through every use case.
setTokenProvider(() => state.token);

/**
 * Callbacks run on logout to drop user-scoped data (query cache, UI gate).
 * Registered from main.ts to keep this module free of app-wiring imports.
 */
type LogoutHook = () => void;
const logoutHooks: LogoutHook[] = [];

export function onLogout(hook: LogoutHook): void {
  logoutHooks.push(hook);
}

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function clearExpiryTimer(): void {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

/**
 * Log out the moment the token dies rather than waiting for the user's next
 * click to fail. setTimeout is clamped to ~24 days, well above the 1h token.
 */
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

async function requestOtp(identifier: string): Promise<void> {
  await requestOtpUseCase(identifier);
  state.pendingIdentifier = identifier;
}

async function verifyOtp(otp: string): Promise<void> {
  const identifier = state.pendingIdentifier ?? '';
  const session = await verifyOtpUseCase(identifier, otp);
  state.token = session.token;
  state.identifier = session.identifier;
  state.expiresAt = session.expiresAt;
  state.pendingIdentifier = null;
  persist();
  scheduleExpiry();
}

async function fetchCurrentUser(): Promise<void> {
  if (!state.token) return;
  state.identifier = await fetchCurrentUserUseCase();
  persist();
}

function logout(): void {
  clearExpiryTimer();
  state.token = null;
  state.identifier = null;
  state.expiresAt = null;
  state.pendingIdentifier = null;
  persist();
  // Drop everything scoped to the session that just ended, so the next
  // login can't briefly render the previous user's data.
  logoutHooks.forEach((hook) => hook());
}

// A session restored from localStorage needs its expiry timer armed too.
scheduleExpiry();

export function useAuth() {
  return {
    state: readonly(state),
    isAuthenticated,
    requestOtp,
    verifyOtp,
    fetchCurrentUser,
    logout,
  };
}
