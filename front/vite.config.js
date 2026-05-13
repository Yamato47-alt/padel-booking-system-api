import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:63683', // MISMO puerto que Swagger
        changeOrigin: true,
        secure: false                      // aceptar cert de desarrollo
      }
    }
  }
})
