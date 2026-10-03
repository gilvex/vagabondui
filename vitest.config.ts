import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['vagabond-source'] },
  test: { include: ['src/**/*.test.ts', 'packages/*/src/**/*.test.ts'], environment: 'node' },
})
