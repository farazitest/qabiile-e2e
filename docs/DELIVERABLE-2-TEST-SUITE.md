# Deliverable 2: End-to-End Test Suite
**Product:** Qabiile ([https://qabiile.com/](https://qabiile.com/))  
**Assessment:** Senior SQA Engineer · Mediusware  

---

## 1. Test Suite Specification (Table Format)

Below is the complete suite of 10 fully written end-to-end test cases covering multiple distinct journeys (Public Acquisition, Security & Authentication, Protected Route Governance, Mobile Shell, Financial Ledger Transfers, and Timed Auction Bidding).

---

### Case 1: QAB-E2E-001 — Public Navigation & Layout Shell Verification
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-001` |
| **Journey and title** | Public Navigation → Direct entry to landing page renders full navigation shell and brand assets |
| **Priority and risk** | High — First impression failure or broken top-level nav prevents discovery and user acquisition |
| **Type** | Positive / Smoke |
| **Preconditions** | Unauthenticated visitor; modern desktop browser; clean cache |
| **Test data** | URL: `https://qabiile.com/` |
| **Steps** | 1. Navigate to `/`.<br>2. Observe header branding, navigation links, and primary CTA. |
| **Expected result** | Header logo is visible; links for Home, Qabiile, Journey, Rewards, FAQ, Sign In, and Request to Join are displayed with correct hrefs; Hero H1 is visible. |
| **Oracle** | `expect(page.getByRole('heading', { level: 1 })).toBeVisible()`; nav link locators resolve with `toBeVisible()`. |
| **Postconditions and teardown** | None (read-only). |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 2: QAB-E2E-002 — Direct Deep-Link Entry to Hash Anchors
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-002` |
| **Journey and title** | Public Navigation → Direct deep-link URL entry to section anchor scrolls and renders target content |
| **Priority and risk** | Medium — Broken deep links degrade marketing campaign attribution and user sharing |
| **Type** | Positive / Deep Link |
| **Preconditions** | Unauthenticated visitor; browser initialized |
| **Test data** | Deep-link URL: `/#faq` |
| **Steps** | 1. Direct navigation to `https://qabiile.com/#faq`.<br>2. Verify viewport position and target header visibility. |
| **Expected result** | URL retains `/#faq`; FAQ section heading "Frequently Asked Questions" is rendered in viewport. |
| **Oracle** | `expect(page).toHaveURL(/#faq$/)`; `expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible()`. |
| **Postconditions and teardown** | None (read-only). |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 3: QAB-E2E-003 — Browser History & SPA State Preservation
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-003` |
| **Journey and title** | Public Navigation → Browser Back and Forward buttons preserve SPA routing state |
| **Priority and risk** | Medium — Broken client-side history traps users and degrades web accessibility |
| **Type** | Positive / Browser Navigation |
| **Preconditions** | Fresh browser session on landing page |
| **Test data** | Navigation sequence: `/` -> `/sign-in` -> `goBack()` -> `goForward()` |
| **Steps** | 1. Navigate to `/`.<br>2. Click 'Sign In' link in nav bar.<br>3. Verify landing on `/sign-in`.<br>4. Trigger browser `page.goBack()`.<br>5. Trigger browser `page.goForward()`. |
| **Expected result** | Step 3 URL is `/sign-in`. Step 4 returns to Home `/` with Hero visible. Step 5 returns to `/sign-in` with Login form visible. |
| **Oracle** | Assertions on `page.url()` matching respective route regex after each history transition. |
| **Postconditions and teardown** | Browser context terminated. |
| **Automatable** | Yes — Automated in `tests/navigation.spec.ts`. |

---

### Case 4: QAB-E2E-010 — Invalid Credentials Rejection (Dual Register: Table & Gherkin)
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-010` |
| **Journey and title** | Authentication → Login attempt with validly formatted but incorrect credentials is rejected |
| **Priority and risk** | High — False positives create security vulnerability; false negatives lock out legitimate users |
| **Type** | Negative / Security |
| **Preconditions** | Unauthenticated visitor on `/sign-in`; non-existent user identity |
| **Test data** | Email: `not-a-real-user@example.com`, Password: `WrongPassword123!` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Fill Email input with test email.<br>3. Fill Password input with test password.<br>4. Click 'Login →' button. |
| **Expected result** | User remains on `/sign-in`; no session cookie or JWT written to storage; Login button remains visible. |
| **Oracle** | URL matches `/\/sign-in/`; `context.cookies()` contains no authenticated session tokens. |
| **Postconditions and teardown** | No database changes. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 5: QAB-E2E-011 — Client-Side Validation on Empty Submission
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-011` |
| **Journey and title** | Authentication → Empty form submission is blocked client-side without firing server request |
| **Priority and risk** | Medium — Redundant network requests on invalid input increase backend load and reduce UX quality |
| **Type** | Negative / Boundary |
| **Preconditions** | User on `/sign-in` with clean form |
| **Test data** | Email: `""`, Password: `""` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Click 'Login →' button without entering values. |
| **Expected result** | Form submission is blocked client-side; page stays on `/sign-in`; no auth payload dispatched. |
| **Oracle** | `expect(page).toHaveURL(/\/sign-in/)`; login button remains interactive. |
| **Postconditions and teardown** | None. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 6: QAB-E2E-012 — Client-Side Validation on Malformed Email
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-012` |
| **Journey and title** | Authentication → Malformed email format is caught and blocked by input validation |
| **Priority and risk** | Low — Basic input hygiene prevents malformed queries reaching the auth microservice |
| **Type** | Negative / Input Validation |
| **Preconditions** | User on `/sign-in` |
| **Test data** | Email: `not-an-email`, Password: `SomePassword123!` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Fill Email with `not-an-email`.<br>3. Fill Password with valid format string.<br>4. Click 'Login →'. |
| **Expected result** | Input reports invalidity (`validity.valid == false` or `aria-invalid="true"`); user remains on `/sign-in`. |
| **Oracle** | `expect(emailValidity).toBe(false)` and `expect(page).toHaveURL(/\/sign-in/)`. |
| **Postconditions and teardown** | None. |
| **Automatable** | Yes — Automated in `tests/signin-validation.spec.ts`. |

---

### Case 7: QAB-E2E-013 — Successful Real Account Authentication & Session Persistence
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-013` |
| **Journey and title** | Authentication → Valid credentials establish authenticated session and redirect away from sign-in |
| **Priority and risk** | Critical — Core gate for entire authenticated platform capability |
| **Type** | Positive / Security |
| **Preconditions** | Verified test account exists; credentials available via environment |
| **Test data** | `AUTH_EMAIL` and `AUTH_PASSWORD` supplied via `.env` |
| **Steps** | 1. Navigate to `/sign-in`.<br>2. Enter authorized email.<br>3. Enter authorized password.<br>4. Submit form. |
| **Expected result** | Browser establishes authentication cookie/token; navigates away from `/sign-in`; session stored to `user.json`. |
| **Oracle** | `expect(page).not.toHaveURL(/\/sign-in/)`; `storageState` contains valid session cookies. |
| **Postconditions and teardown** | Session file `playwright/.auth/user.json` persisted for test suite reuse. |
| **Automatable** | Yes — Automated in `tests/auth.setup.ts`. |

---

### Case 8: QAB-E2E-020 — Request Access Client-Side Validation
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-020` |
| **Journey and title** | Onboarding → Request to Join form blocks malformed email submissions client-side |
| **Priority and risk** | Medium — Prevents junk invitations and spam queue contamination |
| **Type** | Negative / Input Validation |
| **Preconditions** | Unauthenticated user on `/request-access` |
| **Test data** | Email: `not-an-email` |
| **Steps** | 1. Navigate to `/request-access`.<br>2. Fill email input with `not-an-email`.<br>3. Click 'Request Access →'. |
| **Expected result** | Submission is halted; user remains on `/request-access`; Request Access button remains visible. |
| **Oracle** | `expect(page).toHaveURL(/\/request-access/)`; `expect(button).toBeVisible()`. |
| **Postconditions and teardown** | No record created in access request database. |
| **Automatable** | Yes — Automated in `tests/request-access-validation.spec.ts`. |

---

### Case 9: QAB-E2E-030 — Route Protection & Callback URL Parameter Retention
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-030` |
| **Journey and title** | Security / Routing → Direct unauthenticated access to gated routes redirects to Sign In with callbackUrl |
| **Priority and risk** | High — Unauthenticated access to protected pages could leak private clan or user data |
| **Type** | Security / Permission |
| **Preconditions** | Unauthenticated visitor; clean session |
| **Test data** | Protected routes: `/about`, `/contact` |
| **Steps** | 1. Navigate directly to `/about`.<br>2. Observe URL rewrite and rendered page. |
| **Expected result** | Page immediately redirects to `/sign-in?callbackUrl=%2Fabout`; login form is rendered. |
| **Oracle** | URL matches `/\/sign-in\?callbackUrl=/`; query param `callbackUrl` decodes to `/about`. |
| **Postconditions and teardown** | None. |
| **Automatable** | Yes — Automated in `tests/protected-route-redirect.spec.ts`. |

---

### Case 10: QAB-E2E-040 — Responsive Mobile Viewport Navigation
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-040` |
| **Journey and title** | Mobile Experience → Mobile viewport adapts navigation to toggle drawer and reaches Sign In |
| **Priority and risk** | High — High mobile traffic volume; broken mobile menus block mobile acquisition entirely |
| **Type** | Positive / Responsive |
| **Preconditions** | Mobile viewport emulation (Pixel 7: 412x915) |
| **Test data** | Viewport: `devices['Pixel 7']` |
| **Steps** | 1. Load `/` in mobile viewport.<br>2. Verify mobile header rendered with menu button.<br>3. Open mobile menu.<br>4. Click 'Sign In'. |
| **Expected result** | Landing page adapts cleanly without horizontal overflow; Sign In route reached successfully. |
| **Oracle** | `expect(page).toHaveURL(/\/sign-in/)`; login button visible on mobile viewport. |
| **Postconditions and teardown** | Context closed. |
| **Automatable** | Yes — Automated in `tests/mobile-navigation.spec.ts`. |

---

### Case 11: QAB-E2E-050 — Peer-to-Peer Qabi Transfer & Atomic Ledger Settlement
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-050` |
| **Journey and title** | Digital Economy → Authenticated member transfers Qabi to peer with atomic balance reconciliation |
| **Priority and risk** | Critical — Ledger inconsistency or double-spend destroys economy and user trust |
| **Type** | Positive / Financial Data Integrity |
| **Preconditions** | Sender Account A has 500 Qabi; Recipient Account B exists; active valid session |
| **Test data** | Sender: `userA@test.com`, Recipient: `userB@test.com`, Amount: `50 Qabi` |
| **Steps** | 1. User A logs in and navigates to `/wallet`.<br>2. Records current balance (500 Qabi).<br>3. Clicks 'Transfer Qabi'.<br>4. Inputs Recipient `userB@test.com` and Amount `50`.<br>5. Submits transfer. |
| **Expected result** | UI displays "Transfer Successful"; Sender balance reflects 450 Qabi; Recipient balance reflects +50 Qabi; transaction ID logged. |
| **Oracle** | Database ledger entry created with `status: COMPLETED`, `amount: 50`; sum of balance changes across accounts equals 0 (double-entry audit). |
| **Postconditions and teardown** | Teardown script rolls back test transaction or offsets balance in sandbox environment. |
| **Automatable** | Partly — Blocked on production by rules of engagement (currency mutation on live site); fully automatable on staging/mock API. |

---

### Case 12: QAB-E2E-060 — Timed Hunt Auction Bidding & Escrow Locking
| Field | Value |
|---|---|
| **ID** | `QAB-E2E-060` |
| **Journey and title** | Hunt Auctions → Real-time bid locks Qabi in escrow and updates highest bidder before countdown expires |
| **Priority and risk** | Critical — Flawed auction state causes unfair bidding, lockouts, or lost currency |
| **Type** | Positive / Concurrency & State |
| **Preconditions** | Active hunt listing with 10 mins remaining; current highest bid = 100 Qabi; User has 300 Qabi |
| **Test data** | Hunt ID: `HUNT-9042`, New Bid Amount: `120 Qabi` |
| **Steps** | 1. User navigates to active hunt page `/#hunts/HUNT-9042`.<br>2. Enters bid amount `120`.<br>3. Confirms bid placement.<br>4. Observes live price update. |
| **Expected result** | User becomes new highest bidder; current price displays `120 Qabi`; 120 Qabi moved to escrow in user wallet. |
| **Oracle** | WebSocket broadcast event `BID_PLACED` received by all connected clients; database escrow table records active lock on User ID. |
| **Postconditions and teardown** | Hunt settles upon timer expiry or gets cancelled in test environment. |
| **Automatable** | Partly — Requires staging environment with controllable auction lifecycle timers. |

---

## 2. Gherkin Feature Specification (QAB-E2E-010)

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
