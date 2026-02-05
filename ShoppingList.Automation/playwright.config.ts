import { defineConfig, devices } from '@playwright/test';

const baseURL = (process.env.PLAYWRIGHT_BASE_URL ??
  'http://localhost:5173') as string;

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  
  use: {
   baseURL: baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
