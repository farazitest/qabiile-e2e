import { test, expect } from '@playwright/test';

/**
 * Case mapping:
 *  QAB-E2E-030 - Unauthenticated access to a gated route redirects to
 *                /sign-in with a callbackUrl pointing back at the original
 *                destination.
 *
 * Finding from reconnaissance: /about and /contact - both listed in the
 * public footer as ordinary marketing pages - actually render the sign-in
 * form and rewrite the URL to
 *   /sign-in?callbackUrl=<original-url>
 * for an unauthenticated visitor. That is worth flagging as a product
 * question in the report (should About/Contact be public marketing pages
 * that don't require a login?), independent of whether it's "correct".
 * This spec locks down the *current* behavior so a regression - e.g. the
 * callback URL silently dropping the original destination - would fail
 * the build.
 */

const gatedRoutes = ['/about', '/contact'];

for (const route of gatedRoutes) {
  test(`QAB-E2E-030 - unauthenticated visit to ${route} redirects to sign-in with callbackUrl`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=/);

    const url = new URL(page.url());
    const callbackUrl = url.searchParams.get('callbackUrl');
    expect(callbackUrl).not.toBeNull();
    expect(decodeURIComponent(callbackUrl as string)).toContain(route);

    // Confirm we actually land on a real sign-in form, not a broken/blank state.
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
}
