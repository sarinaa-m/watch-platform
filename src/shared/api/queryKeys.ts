export const movieKeys = {
  all: ['movies'] as const,
  list: () => [...movieKeys.all, 'list'] as const,
  detail: (id: number | string) => [...movieKeys.all, 'detail', id] as const,
};

export const watchProgressKeys = {
  all: ['watchProgress'] as const,
  continueWatching: (identifier: string) =>
    [...watchProgressKeys.all, 'continueWatching', identifier] as const,
};
export const authKeys = {
  all: ['auth'] as const,
  currentUser: (identifier: string) => [...authKeys.all, 'currentUser', identifier] as const,
};
export const healthKeys = {
  all: ['health'] as const,
  status: () => [...healthKeys.all, 'status'] as const,
};
