export const PATHS = {
  login: { name: 'login', path: '/login' },
  profile: { name: 'profile', path: '/profiles' },
  home: { name: 'home', path: '/' },
  continueWatching: { name: 'continueWatching', path: '/continue' },
  title: { name: 'title', path: '/title/:id' },
  watch: { name: 'watch', path: '/watch/:id' },
  notFound: { name: 'notFound', path: '/:pathMatch(.*)*' },
} as const;
