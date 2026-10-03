import { defineConfig, defaultClientConditions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    conditions:
      command === 'serve'
        ? ['vagabond-source', ...defaultClientConditions]
        : [...defaultClientConditions],
  },
  optimizeDeps: { exclude: ['vagabond-ui'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replaceAll('\\', '/')
          if (/\/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(path))
            return 'motion'
          if (/\/node_modules\/(radix-ui|cmdk|sonner|@radix-ui\/[^/]+)\//.test(path))
            return 'primitives'
        },
      },
    },
  },
}))
