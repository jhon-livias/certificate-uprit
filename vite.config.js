import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleDownloadRequest } from './api/dev-download.js'
import { handleVerifyRequest } from './api/dev-verify.js'

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
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
