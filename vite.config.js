import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleDownloadRequest } from './api/dev-download.js'

function downloadApiPlugin() {
  return {
    name: 'download-api',
    configureServer(server) {
      server.middlewares.use('/api/download', handleDownloadRequest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    downloadApiPlugin(),
  ],
})
