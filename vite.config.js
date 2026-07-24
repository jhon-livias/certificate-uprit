import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleDownloadRequest } from './api/dev-download.js'
import { handleVerifyRequest } from './api/dev-verify.js'
import { handleDownloadGradoRequest } from './api/dev-download-grado.js'
import { handleVerifyGradoRequest } from './api/dev-verify-grado.js'

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Grado debe ir primero para no ser capturado por los startsWith de fedatario
        if (req.url === '/api/download-grado') {
          handleDownloadGradoRequest(req, res)
          return
        }
        if (req.url === '/api/verify-grado') {
          handleVerifyGradoRequest(req, res)
          return
        }
        if (req.url?.startsWith('/api/download')) {
          handleDownloadRequest(req, res)
          return
        }
        if (req.url?.startsWith('/api/verify')) {
          handleVerifyRequest(req, res)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiPlugin(),
  ],
})
