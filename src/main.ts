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

onLogout(() => {
  queryClient.clear();
  useUiState().reset();
});

window.addEventListener('auth:unauthorized', () => {
  const auth = useAuth();
  auth.logout();
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' });
  }
});

app.mount('#app');
