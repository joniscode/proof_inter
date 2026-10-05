import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import texts from './src/content/texts.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'API_');
  const target = process.env.API_TARGET ?? env.API_TARGET ?? 'http://localhost:3000';
  const url = new URL(target);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(texts.errors.invalidApiTarget);
  }
  const proxy = {
    '/api': { target, changeOrigin: true },
    '^/health$': { target, changeOrigin: true },
  };
  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
  };
});
