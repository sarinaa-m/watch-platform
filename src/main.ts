import './polyfills';
import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from '@infra/router';
import { i18n } from '@infra/i18n';
import '@infra/state/localeState';
import { useAuth, onLogout } from '@infra/state/authState';
import { useUiState } from '@infra/state/uiState';
import { queryClient } from '@infra/query/queryClient';
import '@presentation/styles/base.css';

const app = createApp(App);
app.use(router);
app.use(i18n);
app.use(VueQueryPlugin, { queryClient });

// Logout must drop every trace of the session that just ended — otherwise
// the next login briefly renders the previous user's cached data.
onLogout(() => {
  // clear() drops all server state, including continue-watching.
  queryClient.clear();
  useUiState().reset();
});

// Central 401 handling: a 401 on a request that *carried* a token means the
// session is dead (1-hour JWTs, no refresh token), so clear it and bounce to
// /login. The http client does not fire this for the invalid-OTP 401.
window.addEventListener('auth:unauthorized', () => {
  const auth = useAuth();
  auth.logout();
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' });
  }
});

app.mount('#app');
