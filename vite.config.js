// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // optional, if needed in your project
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.sportsdata.io/v4/soccer/scores/json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true, // ✅ keep for HTTPS targets
      },
    },
  },
});
