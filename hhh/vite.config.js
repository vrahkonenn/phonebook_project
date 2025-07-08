import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://phonebook-project-5xys.onrender.com/',
        changeOrigin: true,
      },
    }
  },
})
