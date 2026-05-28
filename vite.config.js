import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleDownloadRequest } from './api/dev-download.js'

function downloadApiPlugin() {
  return {
    name: 'download-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/download')) {
          handleDownloadRequest(req, res);
          return;
        }
        next();
      });
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
