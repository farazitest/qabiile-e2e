import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Case mapping:
 *  QAB-E2E-001 - Public nav renders and links are reachable on direct load
 *  QAB-E2E-002 - Direct deep-link entry to an anchor section renders correctly
 *  QAB-E2E-003 - Browser back/forward preserves SPA navigation state
 */

test.describe('Public navigation', () => {
  test('QAB-E2E-001 - home page loads with full nav shell', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectLoaded();

    await expect(home.nav.homeLink).toBeVisible();
    await expect(home.nav.qabiileLink).toBeVisible();
    await expect(home.nav.journeyLink).toBeVisible();
    await expect(home.nav.rewardsLink).toBeVisible();
    await expect(home.nav.faqLink).toBeVisible();
  });

  test('QAB-E2E-002 - direct deep link to an anchor section loads that section', async ({ page }) => {
    // Entering on a hash route directly (not via in-app click) is the
    // scenario most likely to break in an SPA shell.
    await page.goto('/#faq', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  });

  test('QAB-E2E-003 - browser back/forward navigates between Sign In and Home correctly', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectLoaded();

    await home.nav.gotoSignIn();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goBack();
    await expect(page).toHaveURL(/qabiile\.com\/?(#.*)?$/);
    await home.expectLoaded();

    await page.goForward();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
