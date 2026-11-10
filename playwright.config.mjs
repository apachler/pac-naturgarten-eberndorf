import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { baseURL: 'http://localhost:4173', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/server.mjs', url: 'http://localhost:4173/index.html', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'handy', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'kleines-handy', use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
});
