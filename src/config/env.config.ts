/**
 * Centralized environment configuration.
 * Access env variables via: envConfig.baseApiUrl
 *
 * Reads `window._env_` first (populated at container start by env.sh from
 * runtime env vars) and falls back to the build-time `import.meta.env`
 * values, so the same Docker image can be reconfigured per environment.
 */
const getEnvVar = (key: keyof ImportMetaEnv): string => {
  return (window._env_?.[key] || import.meta.env[key]) ?? '';
};

export const envConfig = {
  baseApiUrl: getEnvVar('VITE_API_BASE_URL'),
};
