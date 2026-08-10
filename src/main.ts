import './polyfills';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from '@infra/router';
import { useAuthStore } from '@infra/storage/authStore';
import { queryClient } from '@infra/query/queryClient';
import '@presentation/styles/base.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });

// Central 401 handling: any API call that gets a 401 clears the session
// and bounces to /login, since the API issues 1-hour tokens with no
// refresh token.
window.addEventListener('auth:unauthorized', () => {
  const auth = useAuthStore();
  auth.logout();
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' });
  }
});

app.mount('#app');
