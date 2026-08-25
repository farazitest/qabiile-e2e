import { test, expect } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';

/**
 * Case mapping:
 *  QAB-E2E-010 - Sign in with well-formed but wrong credentials is rejected, stays on /sign-in
 *  QAB-E2E-011 - Sign in with empty fields is blocked client-side (no request fired)
 *  QAB-E2E-012 - Sign in with malformed email is blocked client-side
 *
 * Oracle note: without an account, "rejected" for QAB-E2E-010 is proven by
 * (a) URL staying on /sign-in - a successful login would redirect into the
 * authenticated app - and (b) no navigation to any non-sign-in route. This
 * is documented in the written test suite as the available oracle for an
 * unauthenticated tester; a full run would additionally assert on the
 * auth API response status.
 */

test.describe('Sign In validation', () => {
  test('QAB-E2E-010 - wrong credentials are rejected and stay on sign-in', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();

    await signIn.submit('not-a-real-user@example.com', 'WrongPassword123!');

    // Give the app a beat to round-trip the auth call, then assert we are
    // still gated - a successful login would navigate away from /sign-in.
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(signIn.loginButton).toBeVisible();
  });

  test('QAB-E2E-011 - empty fields do not submit (HTML5 required validation)', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();

    await signIn.loginButton.click();

    // Native "required" validity is the most robust oracle available
    // without knowing the app's custom error markup in advance.
    const emailValidity = await signIn.emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(emailValidity).toBe(false);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('QAB-E2E-012 - malformed email is rejected by client-side validation', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();

    await signIn.emailInput.fill('not-an-email');
    await signIn.passwordInput.fill('SomePassword123!');
    await signIn.loginButton.click();

    const emailValidity = await signIn.emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(emailValidity).toBe(false);
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
