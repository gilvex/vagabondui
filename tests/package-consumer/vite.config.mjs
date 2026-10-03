import { defineConfig } from 'vite'

// No Tailwind plugin or workspace aliases: only the installed package and its compiled CSS.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // This fixture is entirely client-rendered. The export check separately verifies that
        // the installed ESM retains these directives for server-component-aware consumers.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client'))
          return
        warn(warning)
      },
    },
  },
})
