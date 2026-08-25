import { Page, Locator, expect } from '@playwright/test';

/**
 * The primary nav is present on every public page (it's a shared SPA shell),
 * so it's modelled as its own component object rather than duplicated
 * inside each page object.
 */
export class NavBar {
  readonly page: Page;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly qabiileLink: Locator;
  readonly journeyLink: Locator;
  readonly rewardsLink: Locator;
  readonly faqLink: Locator;
  readonly signInLink: Locator;
  readonly requestToJoinLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('a[href="https://qabiile.com/"] img, a[href="/"] img').first();
    this.homeLink = page.getByRole('link', { name: 'Home', exact: true });
    this.qabiileLink = page.getByRole('link', { name: 'Qabiile', exact: true });
    this.journeyLink = page.getByRole('link', { name: 'Journey', exact: true });
    this.rewardsLink = page.getByRole('link', { name: 'Rewards', exact: true });
    this.faqLink = page.getByRole('link', { name: 'FAQ', exact: true });
    this.signInLink = page.getByRole('link', { name: 'Sign In', exact: true });
    this.requestToJoinLink = page.getByRole('link', { name: 'Request to Join', exact: true });
  }

  async gotoSignIn() {
    await this.signInLink.click();
  }

  async gotoRequestToJoin() {
    await this.requestToJoinLink.click();
  }

  /** Asserts the shared nav shell rendered - used as a smoke check on every page object. */
  async expectVisible() {
    await expect(this.signInLink).toBeVisible();
    await expect(this.requestToJoinLink).toBeVisible();
  }
}
