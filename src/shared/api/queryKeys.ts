export const movieKeys = {
  all: ['movies'] as const,
  list: () => [...movieKeys.all, 'list'] as const,
  detail: (id: number | string) => [...movieKeys.all, 'detail', id] as const,
};

export const watchProgressKeys = {
  all: ['watchProgress'] as const,
  continueWatching: () => [...watchProgressKeys.all, 'continueWatching'] as const,
};
