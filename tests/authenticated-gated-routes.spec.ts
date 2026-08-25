import { test, expect } from '@playwright/test';

/**
 * Runs under the `authenticated-chrome` project only (see playwright.config.ts
 * testMatch), which depends on `setup` (tests/auth.setup.ts) and reuses the
 * saved session via storageState - no login form submission happens in this
 * file at all.
 *
 * Case mapping:
 *  QAB-E2E-031 - Authenticated visit to a previously gated route succeeds
 *                (no redirect to /sign-in), the mirror image of QAB-E2E-030.
 */

const previouslyGatedRoutes = ['/about', '/contact'];

for (const route of previouslyGatedRoutes) {
  test(`QAB-E2E-031 - authenticated visit to ${route} does not redirect to sign-in`, async ({ page }) => {
    await page.goto(route);

    await expect(page).not.toHaveURL(/\/sign-in/);
    // TODO on assessment day: replace with a concrete assertion on the real
    // page content once the authenticated layout is visible (e.g. a
    // heading specific to that route, or a signed-in nav state).
  });
}

test('QAB-E2E-014 - authenticated nav no longer offers Sign In / Request to Join', async ({ page }) => {
  await page.goto('/');

  // Mirror image of NavBar.expectVisible() for the anonymous case: once
  // authenticated, the entry-points into auth should disappear (replaced
  // by a profile/sign-out affordance). Exact selector for that
  // affordance is unknown ahead of time - confirm and tighten on the day.
  await expect(page.getByRole('link', { name: 'Sign In', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Request to Join', exact: true })).toHaveCount(0);
});
