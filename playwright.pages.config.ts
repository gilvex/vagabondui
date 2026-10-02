import { defineConfig, devices } from '@playwright/test'

const liveURL = process.env.SHOWCASE_URL
const baseURL = liveURL || 'http://127.0.0.1:4174/vagabondui/'

export default defineConfig({
  testDir: './tests/deployment',
  outputDir: './test-results/pages',
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: liveURL
    ? undefined
    : {
        command: 'pnpm run preview:pages',
        url: baseURL,
        reuseExistingServer: false,
      },
})
