import { test as setup, expect } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';
import fs from 'fs';
import path from 'path';

/**
 * QAB-E2E-013 - Sign in with the provided real test account succeeds.
 *
 * This is Playwright's recommended "setup project" pattern: log in exactly
 * ONCE, save the authenticated session to disk, and every spec in the
 * `authenticated-chrome` project reuses that storageState instead of
 * re-submitting the login form. That keeps us at a single login request
 * against a live third-party account, in line with the assessment's
 * low-volume rule - not N logins across N authenticated specs.
 *
 * Credentials come from AUTH_EMAIL / AUTH_PASSWORD, loaded from a local
 * .env file (see .env.example) - never hardcoded here and never committed.
 */

const authDir = path.resolve('playwright/.auth');
const authFile = path.join(authDir, 'user.json');

setup('authenticate (QAB-E2E-013)', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const env = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env;
  const email = env?.AUTH_EMAIL;
  const password = env?.AUTH_PASSWORD;

  if (!email || !password) {
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(
      true,
      'AUTH_EMAIL / AUTH_PASSWORD not set. Copy .env.example to .env and fill ' +
      'in the real test account credentials to enable authenticated coverage.'
    );
    return;
  }

  const signIn = new SignInPage(page);
  await signIn.goto();
  await signIn.submit(email, password);

  // Oracle for a successful login: we leave /sign-in entirely (a failed
  // login stays there - see QAB-E2E-010..012). Exact authenticated landing
  // route (dashboard, qabiile hall, etc.) should be confirmed on the day
  // and this assertion tightened to match it precisely.
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
