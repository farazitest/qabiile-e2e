import { Page, Locator, expect } from '@playwright/test';
import { NavBar } from './NavBar';

export class HomePage {
  readonly page: Page;
  readonly nav: NavBar;
  readonly heroHeading: Locator;
  readonly claimYourPlaceCta: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.heroHeading = page.getByRole('heading', { level: 1 });
    // Two "Claim Your Place" CTAs exist on the page (hero + footer CTA band);
    // callers that care which one should scope further, this grabs the first.
    this.claimYourPlaceCta = page.getByRole('link', { name: 'Claim Your Place' }).first();
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/qabiile\.com\/?(#.*)?$/);
    await expect(this.heroHeading).toBeVisible();
    await this.nav.expectVisible();
  }
}
