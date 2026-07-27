import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

const compressionPlugin = (compression as any).default || compression

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compressionPlugin({ algorithm: 'gzip', ext: '.gz' }),
    compressionPlugin({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  server: {
    watch: {
      ignored: ['**/design/**'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-core'
            }
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
