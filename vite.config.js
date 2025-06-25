// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // ✅ You are deploying to root domain (not a subfolder)

  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'], // Optional exclusion
  },

  server: {
    proxy: {
      // ✅ Proxy used only for local development
      '/api': {
        target: 'https://api.sportsdata.io/v4/soccer/scores/json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 600, // Optional: avoid Netlify build warning
  },
});
