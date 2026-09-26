import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8458',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile-chromium',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 320, height: 720 } },
    },
  ],
  webServer: {
    // Always build and own this server; never test a stale developer preview.
    command: 'tsc --noEmit && vite build && vite preview --host 127.0.0.1 --port 8458 --strictPort',
    url: 'http://127.0.0.1:8458',
    reuseExistingServer: false,
    env: { PUBLIC_BASE_PATH: '/', VITE_DEMO_MODE: 'false' },
    timeout: 120_000,
  },
});
