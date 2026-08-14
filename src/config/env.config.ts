const getEnvVar = (key: keyof ImportMetaEnv): string => {
  return import.meta.env[key] ?? '';
};

const baseApiUrl = getEnvVar('VITE_API_BASE_URL');

if (!baseApiUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env (see the README) — ' +
      'without it every API call would hit the dev server instead of the API.'
  );
}

export const envConfig = {
  baseApiUrl: baseApiUrl.replace(/\/+$/, ''),
};
