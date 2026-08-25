import { Page, Locator, expect } from '@playwright/test';
import { NavBar } from './NavBar';

export class SignInPage {
  readonly page: Page;
  readonly nav: NavBar;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly requestAccessLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.emailInput = page.locator('input[name="email"]').or(page.getByPlaceholder(/email/i));
    this.passwordInput = page.locator('input[name="password"]').or(page.getByPlaceholder(/password/i));
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.requestAccessLink = page.getByRole('link', { name: /request access/i });
  }

  async goto() {
    await this.page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
  }

  async submit(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Field-level validation errors are rendered by the form library and
   * are not yet confirmed to carry a stable test id. Scoped to text near
   * the input as a resilient fallback - documented as an assumption in
   * the README.
   */
  errorFor(fieldLabel: string): Locator {
    return this.page.getByText(new RegExp(fieldLabel, 'i')).locator('..').getByRole('alert')
      .or(this.page.locator(`text=/${fieldLabel}/i`));
  }
}
