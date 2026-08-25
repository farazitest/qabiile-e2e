# qabiile-e2e

Public-surface E2E automation for [qabiile.com](https://qabiile.com), built for the
Senior SQA Engineer practical assessment at Mediusware.

**Stack:** Playwright + TypeScript (as preferred by the assessment brief).

## Why these specs

There is no test account, so everything here targets the part of the product
that's reachable without authentication: the marketing shell, Sign In,
Request to Join, and the behavior of gated routes. Deeper journeys (missions,
Qabi wallet, hunts, rankings) are covered on paper in the Deliverable 2 test
suite but marked "Automatable: no - requires an authenticated account."

## Setup

```bash
npm install
npx playwright install --with-deps
```

## Running

```bash
npm test                 # full suite, desktop-chrome + mobile-chrome
npx playwright test tests/navigation.spec.ts
npm run test:mobile      # mobile-chrome project only
npm run report           # open the last HTML report
```

Runs against `https://qabiile.com` by default. Override with:

```bash
BASE_URL=https://staging.qabiile.com npm test
```

## Case ID -> automation mapping

| Case ID | Spec file | Covers |
|---|---|---|
| QAB-E2E-001 | `tests/navigation.spec.ts` | Public nav renders on direct load |
| QAB-E2E-002 | `tests/navigation.spec.ts` | Direct deep-link entry to an anchor route |
| QAB-E2E-003 | `tests/navigation.spec.ts` | Browser back/forward across Home <-> Sign In |
| QAB-E2E-010 | `tests/signin-validation.spec.ts` | Wrong credentials rejected |
| QAB-E2E-011 | `tests/signin-validation.spec.ts` | Empty fields blocked client-side |
| QAB-E2E-012 | `tests/signin-validation.spec.ts` | Malformed email blocked client-side |
| QAB-E2E-020 | `tests/request-access-validation.spec.ts` | Malformed email blocked |
| QAB-E2E-021 | `tests/request-access-validation.spec.ts` | Empty email blocked |
| QAB-E2E-022 | `tests/request-access-validation.spec.ts` | Real submission - **skipped unless `TEST_IDENTITY_EMAIL` is set** |
| QAB-E2E-030 | `tests/protected-route-redirect.spec.ts` | Unauthenticated visit to a gated route (`/about`, `/contact`) redirects to `/sign-in?callbackUrl=...` |
| QAB-E2E-040 | `tests/mobile-navigation.spec.ts` | Home -> Sign In journey on a mobile viewport (Pixel 7) |

Full case detail (preconditions, test data, oracle, priority) lives in
Deliverable 2 of the written test suite, not duplicated here.

## What I deliberately did not automate

- **Anything behind login** - joining a qabiile, missions, Qabi wallet
  balance, bidding in a hunt, Hall of Fame ranking. No test account exists
  for this assessment. These are written up as manual/assumption-based
  cases in Deliverable 2 and flagged `Automatable: no`.
- **Real Request Access / Contact submissions in CI** - the form actually
  creates a record on a live third-party system. `QAB-E2E-022` exists but
  stays skipped unless `TEST_IDENTITY_EMAIL` is explicitly set to the exact
  identity provided on assessment day, per the rules of engagement. It is
  never wired into the default CI run.
- **Exact validation error copy** - I couldn't observe live form submission
  ahead of time, so validation specs assert on the browser's native
  `validity.valid` state (a stable oracle that doesn't depend on knowing the
  app's custom error markup) rather than matching specific error text. On
  assessment day this should be tightened to match the actual rendered
  copy if time allows.

## Design notes / assumptions

- **Protected-route finding:** `/about` and `/contact` are listed in the
  public footer as ordinary marketing links, but an unauthenticated visitor
  is redirected to `/sign-in?callbackUrl=<original-url>`. `QAB-E2E-030`
  locks this down as a regression check and is also worth raising as a
  product question in the written report - should these be public pages?
- **No fixed sleeps.** Every wait is a Playwright web-first assertion
  (`expect(locator).toBeVisible()`, `toHaveURL()`, etc.) or the built-in
  auto-waiting on actions. `navigationTimeout` / `actionTimeout` are set
  centrally in `playwright.config.ts` instead of ad hoc waits per test.
- **Isolation.** Every spec calls `goto()` itself and makes no assumption
  about prior test state; no spec depends on another having run first, and
  `fullyParallel: true` would fail fast if one did.
- **Rate-limiting.** Two projects only (desktop + mobile), `workers`
  capped in CI, and the CI workflow runs on push/PR/manual dispatch plus a
  weekly schedule rather than a tight loop - in line with "read-only,
  low-volume" testing against a live client production site.

## Project layout

```
pages/        Page objects (NavBar, HomePage, SignInPage, RequestAccessPage)
tests/        Specs, one file per journey area
playwright.config.ts
.github/workflows/e2e.yml
```
