import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),
    ],
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 5173,
    },
    preview: {
      port: Number(env.VITE_PORT) || 5173,
    },
    resolve: {
      alias: {
        '@config': path.resolve(__dirname, 'src/config'),
        '@domain': path.resolve(__dirname, 'src/domain'),
        '@application': path.resolve(__dirname, 'src/application'),
        '@infra': path.resolve(__dirname, 'src/infrastructure'),
        '@presentation': path.resolve(__dirname, 'src/presentation'),
        '@shared': path.resolve(__dirname, 'src/shared'),
      },
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
    },
  };
});
