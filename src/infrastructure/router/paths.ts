export const PATHS = {
  login: { name: 'login', path: '/login' },
  profile: { name: 'profile', path: '/profiles' },
  home: { name: 'home', path: '/' },
  continueWatching: { name: 'continueWatching', path: '/continue' },
  search: { name: 'search', path: '/search' },
  title: { name: 'title', path: '/title/:id' },
  watch: { name: 'watch', path: '/watch/:id' },
} as const;
