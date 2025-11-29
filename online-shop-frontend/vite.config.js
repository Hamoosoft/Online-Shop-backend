import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Pour que Docker puisse exposer le port
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9090', // On redirige tout ce qui est "/api" vers le Backend sur 9090
        changeOrigin: true,
        secure: false,
      }
    }
  }
})