import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@infra/storage/authStore';
import { PATHS } from './paths';

const routes: RouteRecordRaw[] = [
  {
    path: PATHS.login.path,
    name: PATHS.login.name,
    component: () => import('@presentation/pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: PATHS.home.path,
    name: PATHS.home.name,
    component: () => import('@presentation/pages/HomePage.vue'),
  },
  {
    path: PATHS.watch.path,
    name: PATHS.watch.name,
    component: () => import('@presentation/pages/WatchPage.vue'),
    props: true,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: PATHS.login.name, query: { redirect: to.fullPath } };
  }
  if (to.name === PATHS.login.name && auth.isAuthenticated) {
    return { name: PATHS.home.name };
  }
});
