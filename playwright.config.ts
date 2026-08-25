import { defineConfig, devices } from '@playwright/test';

const env = (globalThis as typeof globalThis & {
  process?: { env: Record<string, string | undefined> };
}).process?.env ?? {};

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
  forbidOnly: !!env.CI,
  retries: env.CI ? 1 : 0,
  workers: env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: env.BASE_URL ?? 'https://qabiile.com',
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
      testIgnore: /authenticated/,
    },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 7'] },
    //   testIgnore: /authenticated/,
    // },
    {
      // Logs in once (skips itself cleanly if no credentials are set) and
      // writes playwright/.auth/user.json for the authenticated project below.
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      // Only picks up specs that actually need a session - kept out of
      // desktop-chrome/mobile-chrome via testIgnore above so an unauthenticated
      // run never accidentally depends on the real account.
      name: 'authenticated-chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      testMatch: /authenticated.*\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],
});
