// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // ✅ Local proxy only used for development
      '/api': {
        target: 'https://api.sportsdata.io/v4/soccer/scores/json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
  build: {
    // Optional: Split large chunks to avoid Netlify warnings
    chunkSizeWarningLimit: 600,
  },
});
