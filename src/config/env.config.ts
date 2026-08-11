const getEnvVar = (key: keyof ImportMetaEnv): string => {
  return (window._env_?.[key] || import.meta.env[key]) ?? '';
};

const baseApiUrl = getEnvVar('VITE_API_BASE_URL');

// An empty base URL is the worst kind of misconfiguration: requests resolve
// against the page origin, Vite's SPA fallback answers `/movies` with
// index.html and a 200, and the app silently renders an empty catalog. Fail
// loudly at startup instead.
if (!baseApiUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env (see the README) — ' +
      'without it every API call would hit the dev server instead of the API.'
  );
}

export const envConfig = {
  // Trailing slashes would produce `//movies`, which the edge may not route.
  baseApiUrl: baseApiUrl.replace(/\/+$/, ''),
};
