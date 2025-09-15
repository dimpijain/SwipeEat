// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This will proxy any request starting with /gmaps
      '/gmaps': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        // Rewrite the path: remove '/gmaps' from the start
        rewrite: (path) => path.replace(/^\/gmaps/, ''),
      },
    },
  },
})
