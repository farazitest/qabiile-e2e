import { Page, Locator } from '@playwright/test';
import { NavBar } from './NavBar';

export class RequestAccessPage {
  readonly page: Page;
  readonly nav: NavBar;
  readonly emailInput: Locator;
  readonly requestAccessButton: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.emailInput = page.locator('input[name="email"]').or(page.getByPlaceholder('user@email.com'));
    this.requestAccessButton = page.getByRole('button', { name: /request access/i });
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/request-access');
    await this.page.waitForLoadState('domcontentloaded');
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async submit(email: string) {
    await this.page.waitForLoadState('networkidle').catch(() => { });
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(300);
    await this.requestAccessButton.click();
  }
}
