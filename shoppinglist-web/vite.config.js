import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy `/api` to your locally-running API during development.
// Adjust `target` if your local API runs on a different port.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5014',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
