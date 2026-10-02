import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-lib',
    lib: { entry: 'src/lib/bundle.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^motion\//,
        /^@radix-ui\//,
        'radix-ui',
        'cmdk',
        'sonner',
        'lucide-react',
      ],
    },
  },
})
