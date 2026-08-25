import { test, expect, devices } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Case mapping:
 *  QAB-E2E-040 - Home page and Sign In flow entry work on a mobile viewport
 *
 * Runs under the `mobile-chrome` project (Pixel 7 emulation) configured in
 * playwright.config.ts. Kept as its own project rather than a per-test
 * viewport override so `npm run test:mobile` can target just this pass.
 */
test.use({ ...devices['Pixel 7'] });

test('QAB-E2E-040 - home page and sign-in entry work on a mobile viewport', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.heroHeading).toBeVisible();

    // On small viewports the primary nav collapses into a menu button
    const menuToggle = page.getByRole('button', { name: /open menu|menu/i });
    if (await menuToggle.isVisible().catch(() => false)) {
        await menuToggle.click();
    }

    const signInLink = page.getByRole('link', { name: 'Sign In', exact: true }).first();
    await signInLink.click();
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});
