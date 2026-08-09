import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from '@infra/router';
import { useAuthStore } from '@infra/storage/authStore';
import '@presentation/styles/base.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);

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
