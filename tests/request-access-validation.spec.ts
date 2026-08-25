import { test, expect } from '@playwright/test';
import { RequestAccessPage } from '../pages/RequestAccessPage';

/**
 * Case mapping:
 *  QAB-E2E-020 - Malformed email is rejected by client-side validation
 *  QAB-E2E-021 - Empty email does not submit
 *  QAB-E2E-022 - Valid submission with the assessor-provided test identity
 *                (SKIPPED unless TEST_IDENTITY_EMAIL is set - this form
 *                actually writes a record, so per the rules of engagement
 *                it must only run with the exact identity given on the
 *                day, and every real run must be logged in the report.)
 */

test.describe('Request Access validation', () => {
  test('QAB-E2E-020 - malformed email is rejected by client-side validation', async ({ page }) => {
    const requestAccess = new RequestAccessPage(page);
    await requestAccess.goto();

    await requestAccess.emailInput.fill('not-an-email');
    await requestAccess.requestAccessButton.click();

    await expect(page).toHaveURL(/\/request-access/);
    await expect(requestAccess.requestAccessButton).toBeVisible();
  });

  test('QAB-E2E-021 - empty email does not submit', async ({ page }) => {
    const requestAccess = new RequestAccessPage(page);
    await requestAccess.goto();

    await requestAccess.requestAccessButton.click();

    await expect(page).toHaveURL(/\/request-access/);
    await expect(requestAccess.requestAccessButton).toBeVisible();
  });

  test('QAB-E2E-022 - valid submission with assessor-provided identity is accepted', async ({ page }) => {
    test.skip(
      !process.env.TEST_IDENTITY_EMAIL,
      'Set TEST_IDENTITY_EMAIL to the exact test identity given on assessment day before enabling this test. ' +
      'This performs a real, logged submission against the live site - do not run it ad hoc.'
    );

    const requestAccess = new RequestAccessPage(page);
    await requestAccess.goto();
    await requestAccess.submit(process.env.TEST_IDENTITY_EMAIL as string);

    // TODO on assessment day: replace with the actual confirmation state
    // observed after a real submission (toast, redirect, or disabled form).
    await expect(page).toHaveURL(/\/request-access/);
  });
});
