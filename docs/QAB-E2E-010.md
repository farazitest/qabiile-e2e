# QAB-E2E-010 — written in both registers

Per the assessment brief: "Write one of your cases in Gherkin (Given / When /
Then) as well as in the table format, so we can see both registers of your
writing." This is that case. It's also the one automated in
`tests/signin-validation.spec.ts`.

## Table format

| Field | Value |
|---|---|
| ID | QAB-E2E-010 |
| Journey / Title | Sign In → Login attempt with valid-format but incorrect credentials is rejected |
| Priority & Risk | High — a false-positive login (auth bypass) or a false-negative that locks out real members both directly threaten the platform's trust and economy |
| Type | Negative |
| Preconditions | No active session (fresh browser context); no account exists with the tested email |
| Test Data | Email: `not-a-real-user@example.com`, Password: `WrongPassword123!` |
| Steps | 1. Navigate to `/sign-in`.<br>2. Enter the test email into Email Address.<br>3. Enter the test password into Password.<br>4. Click Login. |
| Expected Result | User remains on `/sign-in`; no authenticated session is established; no redirect into the app shell occurs |
| Oracle | URL stays on `/sign-in` after the auth round-trip completes (a successful login would navigate away); no auth/session cookie is set. In a full run with API visibility, the auth endpoint additionally returns a 401/403, not a 200 with a session token |
| Postconditions & Teardown | No state change — nothing to tear down; no account was created or modified |
| Automatable | Yes — automated as `QAB-E2E-010` in `tests/signin-validation.spec.ts` |

## Gherkin

```gherkin
Feature: Sign In
  As a visitor without an account
  I want incorrect credentials to be rejected
  So that the platform's currency and community data stay protected

  Scenario: QAB-E2E-010 - Reject well-formed but incorrect credentials
    Given I am on the Sign In page with no active session
    When I enter "not-a-real-user@example.com" as my email
    And I enter "WrongPassword123!" as my password
    And I click "Login"
    Then I should remain on the Sign In page
    And no authenticated session should be established
```
