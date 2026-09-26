import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.PUBLIC_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: process.env.DEV_SERVER_HOST || '127.0.0.1',
    port: Number(process.env.PORT || '8443'),
    strictPort: true,
  },
  preview: {
    host: process.env.DEV_SERVER_HOST || '127.0.0.1',
    port: Number(process.env.PORT || '8443'),
    strictPort: true,
  },
});
