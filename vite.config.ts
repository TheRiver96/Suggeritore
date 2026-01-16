import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Defaults to '/' for local development
  // Set VITE_BASE_PATH=/Suggeritore/ for GitHub Pages
  base: process.env.VITE_BASE_PATH || '/',

  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
