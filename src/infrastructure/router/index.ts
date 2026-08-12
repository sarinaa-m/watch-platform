import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuth } from '@infra/state/authState';
import { PATHS } from './paths';

const routes: RouteRecordRaw[] = [
  {
    path: PATHS.login.path,
    name: PATHS.login.name,
    component: () => import('@presentation/pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: PATHS.profile.path,
    name: PATHS.profile.name,
    component: () => import('@presentation/pages/ProfilePage.vue'),
  },
  {
    path: PATHS.home.path,
    name: PATHS.home.name,
    component: () => import('@presentation/pages/HomePage.vue'),
  },
  {
    path: PATHS.continueWatching.path,
    name: PATHS.continueWatching.name,
    component: () => import('@presentation/pages/ContinueWatchingPage.vue'),
  },
  {
    path: PATHS.search.path,
    name: PATHS.search.name,
    component: () => import('@presentation/pages/SearchPage.vue'),
  },
  {
    path: PATHS.title.path,
    name: PATHS.title.name,
    component: () => import('@presentation/pages/TitlePage.vue'),
    props: true,
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
  const auth = useAuth();
  if (!to.meta.public && !auth.isAuthenticated.value) {
    return { name: PATHS.login.name, query: { redirect: to.fullPath } };
  }
  if (to.name === PATHS.login.name && auth.isAuthenticated.value) {
    return { name: PATHS.home.name };
  }
});
