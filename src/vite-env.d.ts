interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  _env_?: Record<string, string>;
}
