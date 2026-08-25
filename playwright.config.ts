import { defineConfig, devices } from '@playwright/test';

/**
 * Config for public-surface E2E coverage of https://qabiile.com
 *
 * Scope note: per the assessment's rules of engagement, this suite is
 * read-only / low-volume by design. No project runs more than a small,
 * fixed number of specs, there is no retry storm against the live site,
 * and workers are capped so we never hammer production in parallel.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'https://qabiile.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
