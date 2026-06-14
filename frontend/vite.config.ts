import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Vite config: dev server proxies API routes to the Nest backend. */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});
