const getEnvVar = (key: keyof ImportMetaEnv): string => {
  return (window._env_?.[key] || import.meta.env[key]) ?? '';
};

export const envConfig = {
  baseApiUrl: getEnvVar('VITE_API_BASE_URL'),
};
