import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em dev a API roda em outro processo (npm run api); em producao a Vercel
    // resolve /api pelas funcoes serverless Python.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
