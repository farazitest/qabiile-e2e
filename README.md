# qabiile-e2e

Public-surface E2E automation for [qabiile.com](https://qabiile.com), built for the
Senior SQA Engineer practical assessment at Mediusware.

**Stack:** Playwright + TypeScript (as preferred by the assessment brief).

> 📘 **Complete Assessment Deliverables Document:** See [DELIVERABLES.md](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/DELIVERABLES.md) for the full Journey Map, Top 3 Product Risks, 12 complete written test cases with all required fields, Gherkin specifications, and automation rationale.

## Deliverables Index
- [Deliverable 1: Journey Map & Risk Ranking](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/docs/DELIVERABLE-1-JOURNEY-MAP-AND-RISKS.md)
- [Deliverable 2: Complete E2E Test Suite Specification](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/docs/DELIVERABLE-2-TEST-SUITE.md)
- [Deliverable 2: QAB-E2E-010 Dual Register (Gherkin + Table)](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/docs/QAB-E2E-010.md)
- [Master Deliverables Document](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/DELIVERABLES.md)

## Why these specs

Most of the suite targets the part of the product reachable without
authentication: the marketing shell, Sign In, Request to Join, and the
behavior of gated routes. A small set of specs (`authenticated-chrome`
project) also cover what changes once logged in, using one real test
account. Deeper journeys still out of reach with that single account
(missions, Qabi wallet, hunts, Hall of Fame ranking) stay covered on paper
in Deliverable 2, flagged `Automatable: partly` or `no` as appropriate.

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env   # then fill in AUTH_EMAIL / AUTH_PASSWORD locally
```

**Credential handling — read before running the authenticated suite:**
- `.env` is git-ignored. Never commit it, never paste the real values into a
  commit message, PR description, or CI log.
- The login happens exactly **once**, in `tests/auth.setup.ts`, and the
  session is reused via `storageState` by every spec in the
  `authenticated-chrome` project. No spec re-submits the login form.
- If `AUTH_EMAIL`/`AUTH_PASSWORD` aren't set, `setup` and
  `authenticated-chrome` skip cleanly — the public suite (`desktop-chrome`,
  `mobile-chrome`) runs unaffected.
- In CI, these are never read from a plaintext env block — only from
  `secrets.AUTH_EMAIL` / `secrets.AUTH_PASSWORD`, and the authenticated job
  step is skipped entirely unless those secrets are explicitly configured
  on the repo.

## Running

```bash
npm test                     # public suite - desktop-chrome + mobile-chrome only
npx playwright test tests/navigation.spec.ts
npm run test:mobile          # mobile-chrome project only
npm run test:authenticated   # runs `setup` then `authenticated-chrome` - needs .env
npm run report                # open the last HTML report
```

`npm test` deliberately does **not** run the authenticated project by
default (see `testIgnore`/`testMatch` in `playwright.config.ts`) - you opt
into it explicitly with `npm run test:authenticated` once `.env` is filled in.

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
| QAB-E2E-013 | `tests/auth.setup.ts` | Login with the real test account succeeds (runs once, `authenticated-chrome` only) |
| QAB-E2E-014 | `tests/authenticated-gated-routes.spec.ts` | Authenticated nav drops Sign In / Request to Join entry points |
| QAB-E2E-031 | `tests/authenticated-gated-routes.spec.ts` | Authenticated visit to a previously gated route (`/about`, `/contact`) no longer redirects |

Full case detail (preconditions, test data, oracle, priority) lives in
Deliverable 2 of the written test suite, not duplicated here.

## What I deliberately did not automate

- **Deeper authenticated journeys** - joining a qabiile, missions, Qabi
  wallet balance, bidding in a hunt, Hall of Fame ranking. The one test
  account gives us a login and lets us re-check gated routes, but exercising
  currency-affecting flows (earning/spending Qabi, placing a bid) with a
  real account on a live production system is exactly what the rules of
  engagement ask us not to do casually. These stay written up as
  assumption-based cases in Deliverable 2, flagged `Automatable: partly` -
  the login itself is automated, the money-moving steps are not.
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
tests/auth.setup.ts   Logs in once, saves session for the authenticated project
.env.example   Template for local credentials - copy to .env, never commit .env
playwright.config.ts
.github/workflows/e2e.yml
```
