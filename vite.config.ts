import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

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
  server: {
    host: true, // Espone il server su tutti gli indirizzi di rete
    https: process.env.VITE_HTTPS === 'true' ? {
      // Certificato autofirmato per sviluppo locale
      // Su macOS usa: brew install mkcert && mkcert -install
      // Poi genera certificati con: mkcert localhost 192.168.1.x
      key: fs.existsSync('./localhost-key.pem') ? fs.readFileSync('./localhost-key.pem') : undefined,
      cert: fs.existsSync('./localhost.pem') ? fs.readFileSync('./localhost.pem') : undefined,
    } : undefined,
    allowedHosts: true,
  },
})
