# Practical Assessment · Senior SQA Engineer
**Product Under Test:** [https://qabiile.com/](https://qabiile.com/)  
**Company:** Mediusware  
**Role:** Senior SQA Engineer  
**Date:** August 2026  
**Format:** Practical E2E Assessment  

---

## Executive Summary & Reconnaissance

This document contains the complete deliverables for the Senior SQA Engineer practical assessment on **Qabiile** ([https://qabiile.com/](https://qabiile.com/)). 

### Reconnaissance & Architectural Findings
1. **Application Architecture:** Qabiile is built on Next.js App Router with React Streaming Server-Side Rendering (SSR) and Client Components.
2. **Surface Segmentation:**
   - **Public Unauthenticated Surface:** Landing page (`/`, `/#hero`, `/#civilization`, `/#journey`, `/#rewards`, `/#faq`), Sign In (`/sign-in`), Request to Join (`/request-access`), Password Recovery (`/forgot-password`).
   - **Gated / Protected Routes:** Marketing footer links like `/about` and `/contact` enforce authentication and redirect unauthenticated visitors to `/sign-in?callbackUrl=<target-url>`.
   - **Authenticated Social & Economic Surface:** Agora feed, Clan/Qabiile Hall, Missions & XP progression, Qabi wallet & peer transfers, Hunt Market (timed auctions), and Hall of Fame leaderboards.
3. **Strict Compliance with Rules of Engagement:**
   - Testing against production is read-only and low-volume by default.
   - Authentication is executed exactly **once** via a dedicated setup project (`tests/auth.setup.ts`) saving state to `playwright/.auth/user.json`, preventing login flood storms.
   - Zero hardcoded secrets: credentials are strictly managed via environment variables (`.env` and GitHub Secrets).

---

# Deliverable 1: Journey Map and Risk Ranking

## 1.1 End-to-End Core Journeys

The Qabiile platform lives or dies by five primary user journeys from discovery to real-world value realization:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             QABIILE CORE JOURNEY MAP                             │
└──────────────────────────────────────────────────────────────────────────────────┘

 [1. Discovery & Onboarding]
   Landing Visit ──► Request to Join ──► Invitation Code ──► Account Creation ──► Choose Clan
                                                                                      │
 ┌────────────────────────────────────────────────────────────────────────────────────┘
 │
 ▼
 [2. Community & Missions]
   Agora Feed ──► Clan Hall ──► Accept Daily Mission ──► Complete Task ──► Earn XP & Qabi
                                                                               │
 ┌─────────────────────────────────────────────────────────────────────────────┘
 │
 ▼
 [3. Social Economy & Transactions]
   View Qabi Wallet ──► Transfer Qabi to Peer ──► Atomic Ledger Settlement ──► Social Tipping
                                                                                   │
 ┌─────────────────────────────────────────────────────────────────────────────────┘
 │
 ▼
 [4. Timed Hunt Auctions & Reward Fulfillment]
   Browse Hunt Market ──► Place Qabi Bid ──► Escrow Lock ──► Win Auction ──► Real Reward Claim
                                                                                   │
 ┌─────────────────────────────────────────────────────────────────────────────────┘
 │
 ▼
 [5. Progression & Hall of Fame]
   Accumulate Clan Reputation ──► Tier Promotion ──► Global Leaderboard Rank ──► Legend Status
```

### Detailed Journey Specifications:

1. **Journey 1: Acquisition, Invitation & Clan Onboarding**
   - *First Touch:* Visitor lands on marketing page -> Explores ecosystem -> Clicks "Request to Join" -> Submits email.
   - *Conversion:* User receives 6-character invitation code via email -> Enters invitation verification -> Completes account registration (username, password, terms agreement).
   - *Outcome:* User is onboarded into the platform and assigned/chooses their initial Qabiile (clan).

2. **Journey 2: Community Engagement & Mission Execution**
   - *First Touch:* Authenticated user opens Agora feed -> Browses clan discussions, media reels, and clan notices.
   - *Engagement:* Navigates to Clan Hall -> Accepts an active daily mission or survey.
   - *Outcome:* Mission criteria met -> Server validates submission -> User is awarded XP (level progression) and newly minted Qabi currency.

3. **Journey 3: Digital Economy & Peer-to-Peer Transactions**
   - *First Touch:* User accesses Qabi balance wallet.
   - *Transaction:* Selects peer warrior -> Specifies Qabi transfer amount with optional memo -> Confirms transfer.
   - *Outcome:* Atomic ledger balance deduction from sender and credit to recipient with real-time push notification and tamper-proof transaction log.

4. **Journey 4: Timed Hunt Auctions & Real Reward Fulfillment**
   - *First Touch:* User discovers high-tier item in the Hunt Market (merchandise, gift card, experience).
   - *Bidding:* Submits bid using Qabi balance before auction timer expires -> Previous highest bid released from escrow -> Current bid locked in escrow.
   - *Outcome:* Auction settles -> Winning user's Qabi balance finalized -> Shipping/redemption address collected -> Physical/digital reward dispatched.

5. **Journey 5: Reputation, Level Progression & Hall of Fame**
   - *First Touch:* Member participates across clan events, hunts, and Agora posts.
   - *Progression:* Total XP reaches tier boundary -> Tier promotion unlocks restricted Clan Halls and higher bidding privileges.
   - *Outcome:* User ranks on global and clan-specific Hall of Fame leaderboards.

---

## 1.2 Top 3 Product Risks (Unique to Qabiile)

1. **Risk 1 (Economic Abuse & Concurrent Double-Spending):** Race conditions in simultaneous high-frequency Qabi bidding or peer transfers leading to negative balances, unbacked currency inflation, or duplicate real-world reward fulfillment during auction close.
2. **Risk 2 (Sybil Attacks & Multi-Account Invitation Farming):** Coordinated automated bot accounts bypassing invitation gating to exploit referral/mission sign-up Qabi incentives and manipulate clan voting or auction pricing.
3. **Risk 3 (Untrusted Client-Side State & Client Manipulation):** Client-side manipulation of mission completion criteria, countdown auction timers, or balance displays without strict server-side cryptographic and transaction-level reconciliation.

---

# Deliverable 2: The End-to-End Test Suite

Below are 12 comprehensive end-to-end test cases covering public surface, authentication, validation, route protection, mobile responsiveness, and internal economic transactions.

---

### Case 1: QAB-E2E-001 — Public Navigation & Layout Shell Verification
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-001` |
| **Journey / Title** | Public Navigation → Direct entry to landing page renders full navigation shell and brand assets |
| **Priority & Risk** | High — First impression failure or broken top-level nav prevents discovery and user acquisition |
| **Type** | Positive / Smoke |
| **Preconditions** | Unauthenticated visitor; modern desktop browser; clean cache |
| **Test Data** | URL: `https://qabiile.com/` |
| **Steps** | 1. Navigate to `/`.<br>2. Observe header branding, navigation links, and primary CTA. |
| **Expected Result** | Header logo is visible; links for Home, Qabiile, Journey, Rewards, FAQ, Sign In, and Request to Join are displayed with correct hrefs; Hero H1 is visible. |
| **Oracle** | `expect(page.getByRole('heading', { level: 1 })).toBeVisible()`; nav link locators resolve with `toBeVisible()`. |
| **Postconditions** | None (read-only). |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 2: QAB-E2E-002 — Direct Deep-Link Entry to Hash Anchors
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-002` |
| **Journey / Title** | Public Navigation → Direct deep-link URL entry to section anchor scrolls and renders target content |
| **Priority & Risk** | Medium — Broken deep links degrade marketing campaign attribution and user sharing |
| **Type** | Positive / Deep Link |
| **Preconditions** | Unauthenticated visitor; browser initialized |
| **Test Data** | Deep-link URL: `/#faq` |
| **Steps** | 1. Direct navigation to `https://qabiile.com/#faq`.<br>2. Verify viewport position and target header visibility. |
| **Expected Result** | URL retains `/#faq`; FAQ section heading "Frequently Asked Questions" is rendered in viewport. |
| **Oracle** | `expect(page).toHaveURL(/#faq$/)`; `expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible()`. |
| **Postconditions** | None (read-only). |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 3: QAB-E2E-003 — Browser History & SPA State Preservation
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-003` |
| **Journey / Title** | Public Navigation → Browser Back and Forward buttons preserve SPA routing state |
| **Priority & Risk** | Medium — Broken client-side history traps users and degrades web accessibility |
| **Type** | Positive / Browser Navigation |
| **Preconditions** | Fresh browser session on landing page |
| **Test Data** | Navigation sequence: `/` -> `/sign-in` -> `goBack()` -> `goForward()` |
| **Steps** | 1. Navigate to `/`.<br>2. Click 'Sign In' link in nav bar.<br>3. Verify landing on `/sign-in`.<br>4. Trigger browser `page.goBack()`.<br>5. Trigger browser `page.goForward()`. |
| **Expected Result** | Step 3 URL is `/sign-in`. Step 4 returns to Home `/` with Hero visible. Step 5 returns to `/sign-in` with Login form visible. |
| **Oracle** | Assertions on `page.url()` matching respective route regex after each history transition. |
| **Postconditions** | Browser context terminated. |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 4: QAB-E2E-010 — Invalid Credentials Rejection (Written in Table & Gherkin)
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-010` |
| **Journey / Title** | Authentication → Login attempt with validly formatted but incorrect credentials is rejected |
| **Priority & Risk** | High — False positives create security vulnerability; false negatives lock out legitimate users |
| **Type** | Negative / Security |
| **Preconditions** | Unauthenticated visitor on `/sign-in`; non-existent user identity |
| **Test Data** | Email: `not-a-real-user@example.com`, Password: `WrongPassword123!` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Fill Email input with test email.<br>3. Fill Password input with test password.<br>4. Click 'Login →' button. |
| **Expected Result** | User remains on `/sign-in`; no session cookie or JWT written to storage; Login button remains visible. |
| **Oracle** | URL matches `/\/sign-in/`; `context.cookies()` contains no authenticated session tokens. |
| **Postconditions** | No database changes. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 5: QAB-E2E-011 — Client-Side Validation on Empty Submission
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-011` |
| **Journey / Title** | Authentication → Empty form submission is blocked client-side without firing server request |
| **Priority & Risk** | Medium — Redundant network requests on invalid input increase backend load and reduce UX quality |
| **Type** | Negative / Boundary |
| **Preconditions** | User on `/sign-in` with clean form |
| **Test Data** | Email: `""`, Password: `""` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Click 'Login →' button without entering values. |
| **Expected Result** | Form submission is blocked client-side; page stays on `/sign-in`; no auth payload dispatched. |
| **Oracle** | `expect(page).toHaveURL(/\/sign-in/)`; login button remains interactive. |
| **Postconditions** | None. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 6: QAB-E2E-012 — Client-Side Validation on Malformed Email
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-012` |
| **Journey / Title** | Authentication → Malformed email format is caught and blocked by input validation |
| **Priority & Risk** | Low — Basic input hygiene prevents malformed queries reaching the auth microservice |
| **Type** | Negative / Input Validation |
| **Preconditions** | User on `/sign-in` |
| **Test Data** | Email: `not-an-email`, Password: `SomePassword123!` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Fill Email with `not-an-email`.<br>3. Fill Password with valid format string.<br>4. Click 'Login →'. |
| **Expected Result** | Input reports invalidity (`validity.valid == false` or `aria-invalid="true"`); user remains on `/sign-in`. |
| **Oracle** | `expect(emailValidity).toBe(false)` and `expect(page).toHaveURL(/\/sign-in/)`. |
| **Postconditions** | None. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 7: QAB-E2E-013 — Successful Real Account Authentication & Session Persistence
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-013` |
| **Journey / Title** | Authentication → Valid credentials establish authenticated session and redirect away from sign-in |
| **Priority & Risk** | Critical — Core gate for entire authenticated platform capability |
| **Type** | Positive / Security |
| **Preconditions** | Verified test account exists; credentials available via environment |
| **Test Data** | `AUTH_EMAIL` and `AUTH_PASSWORD` supplied via `.env` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Enter authorized email.<br>3. Enter authorized password.<br>4. Submit form. |
| **Expected Result** | Browser establishes authentication cookie/token; navigates away from `/sign-in`; session stored to `user.json`. |
| **Oracle** | `expect(page).not.toHaveURL(/\/sign-in/)`; `storageState` contains valid session cookies. |
| **Postconditions** | Session file `playwright/.auth/user.json` persisted for test suite reuse. |
| **Automatable** | Yes — Automated in `tests/auth.setup.ts`. |

---

### Case 8: QAB-E2E-020 — Request Access Client-Side Validation
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-020` |
| **Journey / Title** | Onboarding → Request to Join form blocks malformed email submissions client-side |
| **Priority & Risk** | Medium — Prevents junk invitations and spam queue contamination |
| **Type** | Negative / Input Validation |
| **Preconditions** | Unauthenticated user on `/request-access` |
| **Test Data** | Email: `not-an-email` |
| **Steps** | 1. Navigate to `/request-access`.<br>2. Fill email input with `not-an-email`.<br>3. Click 'Request Access →'. |
| **Expected Result** | Submission is halted; user remains on `/request-access`; Request Access button remains visible. |
| **Oracle** | `expect(page).toHaveURL(/\/request-access/)`; `expect(button).toBeVisible()`. |
| **Postconditions** | No record created in access request database. |
| **Automatable** | Yes — Automated in `tests/request-access-validation.spec.ts`. |

---

### Case 9: QAB-E2E-030 — Route Protection & Callback URL Parameter Retention
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-030` |
| **Journey / Title** | Security / Routing → Direct unauthenticated access to gated routes redirects to Sign In with callbackUrl |
| **Priority & Risk** | High — Unauthenticated access to protected pages could leak private clan or user data |
| **Type** | Security / Permission |
| **Preconditions** | Unauthenticated visitor; clean session |
| **Test Data** | Protected routes: `/about`, `/contact` |
| **Steps** | 1. Navigate directly to `/about`.<br>2. Observe URL rewrite and rendered page. |
| **Expected Result** | Page immediately redirects to `/sign-in?callbackUrl=%2Fabout`; login form is rendered. |
| **Oracle** | URL matches `/\/sign-in\?callbackUrl=/`; query param `callbackUrl` decodes to `/about`. |
| **Postconditions** | None. |
| **Automatable** | Yes — Automated in `tests/protected-route-redirect.spec.ts`. |

---

### Case 10: QAB-E2E-040 — Responsive Mobile Viewport Navigation
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-040` |
| **Journey / Title** | Mobile Experience → Mobile viewport adapts navigation to toggle drawer and reaches Sign In |
| **Priority & Risk** | High — High mobile traffic volume; broken mobile menus block mobile acquisition entirely |
| **Type** | Positive / Responsive |
| **Preconditions** | Mobile viewport emulation (Pixel 7: 412x915) |
| **Test Data** | Viewport: `devices['Pixel 7']` |
| **Steps** | 1. Load `/` in mobile viewport.<br>2. Verify mobile header rendered with menu button.<br>3. Open mobile menu.<br>4. Click 'Sign In'. |
| **Expected Result** | Landing page adapts cleanly without horizontal overflow; Sign In route reached successfully. |
| **Oracle** | `expect(page).toHaveURL(/\/sign-in/)`; login button visible on mobile viewport. |
| **Postconditions** | Context closed. |
| **Automatable** | Yes — Automated in `tests/mobile-navigation.spec.ts`. |

---

### Case 11: QAB-E2E-050 — Peer-to-Peer Qabi Transfer & Atomic Ledger Settlement
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-050` |
| **Journey / Title** | Digital Economy → Authenticated member transfers Qabi to peer with atomic balance reconciliation |
| **Priority & Risk** | Critical — Ledger inconsistency or double-spend destroys economy and user trust |
| **Type** | Positive / Financial Data Integrity |
| **Preconditions** | Sender Account A has 500 Qabi; Recipient Account B exists; active valid session |
| **Test Data** | Sender: `userA@test.com`, Recipient: `userB@test.com`, Amount: `50 Qabi` |
| **Steps** | 1. User A logs in and navigates to `/wallet`.<br>2. Records current balance (500 Qabi).<br>3. Clicks 'Transfer Qabi'.<br>4. Inputs Recipient `userB@test.com` and Amount `50`.<br>5. Submits transfer. |
| **Expected Result** | UI displays "Transfer Successful"; Sender balance reflects 450 Qabi; Recipient balance reflects +50 Qabi; transaction ID logged. |
| **Oracle** | Database ledger entry created with `status: COMPLETED`, `amount: 50`; sum of balance changes across accounts equals 0 (double-entry audit). |
| **Postconditions** | Teardown script rolls back test transaction or offsets balance in sandbox environment. |
| **Automatable** | Partly — Blocked on production by rules of engagement (currency mutation on live site); fully automatable on staging/mock API. |

---

### Case 12: QAB-E2E-060 — Timed Hunt Auction Bidding & Escrow Locking
| Field | Specification |
|---|---|
| **ID** | `QAB-E2E-060` |
| **Journey / Title** | Hunt Auctions → Real-time bid locks Qabi in escrow and updates highest bidder before countdown expires |
| **Priority & Risk** | Critical — Flawed auction state causes unfair bidding, lockouts, or lost currency |
| **Type** | Positive / Concurrency & State |
| **Preconditions** | Active hunt listing with 10 mins remaining; current highest bid = 100 Qabi; User has 300 Qabi |
| **Test Data** | Hunt ID: `HUNT-9042`, New Bid Amount: `120 Qabi` |
| **Steps** | 1. User navigates to active hunt page `/#hunts/HUNT-9042`.<br>2. Enters bid amount `120`.<br>3. Confirms bid placement.<br>4. Observes live price update. |
| **Expected Result** | User becomes new highest bidder; current price displays `120 Qabi`; 120 Qabi moved to escrow in user wallet. |
| **Oracle** | WebSocket broadcast event `BID_PLACED` received by all connected clients; database escrow table records active lock on User ID. |
| **Postconditions** | Hunt settles upon timer expiry or gets cancelled in test environment. |
| **Automatable** | Partly — Requires staging environment with controllable auction lifecycle timers. |

---

## 2.2 Gherkin Feature Specification for QAB-E2E-010

```gherkin
Feature: User Authentication & Sign-In Validation
  As a registered or prospective member of Qabiile
  I want a secure and robust authentication gateway
  So that unauthorized access is prevented and platform currency remains secure

  Background:
    Given the user has opened a clean browser session
    And the user is on the Qabiile Sign-In page at "/sign-in"

  @security @negative @QAB-E2E-010
  Scenario Outline: Reject well-formed but invalid login credentials
    When the user fills the email field with "<email>"
    And the user fills the password field with "<password>"
    And the user clicks the "Login →" button
    Then the application should reject the authentication attempt
    And the browser should remain on the "/sign-in" route
    And no authenticated session tokens or cookies should be stored
    And the "Login →" button should remain visible and interactive

    Examples:
      | email                      | password          |
      | not-a-real-user@example.com| WrongPassword123! |
      | invalid.tester@qabiile.test| InvalidPass!2026  |
```

---

# Deliverable 3: End-to-End Automation Project

## 3.1 Automation Architecture & Project Layout

The automation suite is written in **Playwright + TypeScript** following the **Page Object Model (POM)** pattern.

```
qabiile-e2e/
├── .github/
│   └── workflows/
│       └── e2e.yml            # CI/CD pipeline running headless E2E + artifact upload
├── pages/                     # Page Object Layer
│   ├── NavBar.ts              # Shared nav header component
│   ├── HomePage.ts            # Landing page & hero components
│   ├── SignInPage.ts          # Sign In form & resilient locators
│   └── RequestAccessPage.ts   # Request to Join form & validation
├── tests/                     # Test Spec Layer
│   ├── auth.setup.ts          # Runs ONCE, authenticates and writes user.json
│   ├── navigation.spec.ts     # QAB-E2E-001, 002, 003 (Public nav, deep links, history)
│   ├── signin-validation.spec.ts        # QAB-E2E-010, 011, 012 (Auth negative & boundary)
│   ├── request-access-validation.spec.ts # QAB-E2E-020, 021, 022 (Access request validation)
│   ├── protected-route-redirect.spec.ts # QAB-E2E-030 (Gated route callbackUrl validation)
│   ├── mobile-navigation.spec.ts       # QAB-E2E-040 (Pixel 7 mobile navigation pass)
│   └── authenticated-gated-routes.spec.ts # QAB-E2E-014, 031 (Session verification)
├── docs/                      # Assessment Documentation
│   ├── QAB-E2E-010.md         # Gherkin + Table dual-register doc
│   └── DELIVERABLES.md        # Comprehensive master deliverables doc
├── playwright.config.ts       # Central config (Timeouts, multi-project, dotenv)
├── package.json               # Scripts & dependencies
└── .env.example               # Credential template
```

---

## 3.2 Execution Matrix & Project Segregation

In `playwright.config.ts`, test execution is segregated into four distinct projects:

1. **`desktop-chrome`:** Runs unauthenticated public specs (`tests/navigation.spec.ts`, `tests/signin-validation.spec.ts`, `tests/request-access-validation.spec.ts`, `tests/protected-route-redirect.spec.ts`).
2. **`mobile-chrome`:** Runs responsive viewport specs under mobile emulation (`Pixel 7`).
3. **`setup`:** Runs `tests/auth.setup.ts` exactly once to authenticate with `AUTH_EMAIL` and `AUTH_PASSWORD` and write `playwright/.auth/user.json`.
4. **`authenticated-chrome`:** Reuses the saved `storageState` to verify authenticated navigation and previously gated routes without redundant login requests.

---

## 3.3 Flakiness Prevention & Web-First Assertions

- **Zero Fixed Sleeps:** No `page.waitForTimeout()` used for arbitrary waits.
- **Hydration-Safe Navigation:** Handled Next.js React streaming SSR by waiting for `domcontentloaded` and ensuring form inputs are visible and interactive before action dispatch.
- **Resilient Locators:** Form inputs use multi-strategy locators (`input[name="..."]` or `getByPlaceholder(...)`) to prevent breakages on CSS re-theming.
- **Strict Isolation:** Every test manages its own context and URL entry; tests can run in any order in parallel.

---

## 3.4 CI/CD Pipeline (`.github/workflows/e2e.yml`)

The repository includes a GitHub Actions workflow that:
1. Triggers on pull requests, pushes to `main`, weekly schedule, and manual dispatch (`workflow_dispatch`).
2. Sets up Node.js 20 with npm caching.
3. Installs Playwright Chromium with dependencies.
4. Executes the public desktop & mobile test suites.
5. Conditionally executes the authenticated suite if repository secrets (`AUTH_EMAIL`/`AUTH_PASSWORD`) are configured.
6. Uploads the complete HTML test report and failure traces as build artifacts.

---

## 3.5 How to Run the Project (Step-by-Step)

### Prerequisites:
- Node.js 18+ installed.

### Commands:

```powershell
# 1. Install dependencies
npm install

# 2. Run the default public test suite
npx.cmd playwright test

# 3. Run mobile viewport tests specifically
npm.cmd run test:mobile

# 4. Run authenticated tests (requires .env populated)
npm.cmd run test:authenticated

# 5. Open the interactive HTML test report
npx.cmd playwright show-report
```

---

## Summary of Completed Requirements

| Assessment Requirement | Status | Verification Reference |
|---|---|---|
| **Deliverable 1: Journey Map & 3 Unique Risks** | ✅ Completed | Sections 1.1 & 1.2 above |
| **Deliverable 2: 8-10 Fully Written Cases with all 11 fields** | ✅ Completed | Section 2.1 (12 comprehensive cases) |
| **Deliverable 2: Dual Register (Table + Gherkin)** | ✅ Completed | Section 2.2 & [docs/QAB-E2E-010.md](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/docs/QAB-E2E-010.md) |
| **Deliverable 3: 4-6 Clean Automated Specs** | ✅ Completed | 7 spec files covering desktop, mobile, auth, routing |
| **Deliverable 3: Page Object Model (POM)** | ✅ Completed | [pages/NavBar.ts](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/pages/NavBar.ts), [pages/HomePage.ts](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/pages/HomePage.ts), [pages/SignInPage.ts](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/pages/SignInPage.ts), [pages/RequestAccessPage.ts](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/pages/RequestAccessPage.ts) |
| **Deliverable 3: No Fixed Sleeps / Web-First Assertions** | ✅ Completed | All specs use `expect(locator)...` |
| **Deliverable 3: GitHub Actions Workflow YAML** | ✅ Completed | [.github/workflows/e2e.yml](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/.github/workflows/e2e.yml) |
| **Deliverable 3: Comprehensive README** | ✅ Completed | [README.md](file:///c:/Users/MW/Downloads/qabiile-e2e/qabiile-e2e/README.md) |
| **Security & Credential Management** | ✅ Completed | `.env` loaded via dotenv, storageState isolated, git-ignored |
