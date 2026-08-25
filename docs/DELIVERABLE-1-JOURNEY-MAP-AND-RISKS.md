# Deliverable 1: Journey Map & Risk Ranking
**Product:** Qabiile ([https://qabiile.com/](https://qabiile.com/))  
**Assessment:** Senior SQA Engineer · Mediusware  

---

## 1. Core End-to-End User Journeys

The Qabiile platform is an invitation-based social economy platform structured around five critical end-to-end journeys that determine its product viability:

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

### Detailed Journey Breakdown:

1. **Journey 1: Acquisition, Invitation & Clan Onboarding**
   - **First Touch:** Visitor navigates to the public marketing site (`/`) to learn about the platform.
   - **Action:** Submits access request via `/request-access` or enters an invite code via `/invitation`.
   - **Conversion:** Receives 6-character code via email -> Verifies code -> Fills registration details (username, email, password, terms agreement).
   - **Outcome That Matters:** User is successfully provisioned on the platform with an initialized profile and assigned/joined to their first Qabiile (clan).

2. **Journey 2: Community Engagement & Mission Execution**
   - **First Touch:** User logs in and visits Agora (community feed) and Clan Hall (`/clan`).
   - **Action:** Accepts an active daily quest, survey, or collaborative mission.
   - **Execution:** Submits required proof/action (e.g. posting content, participating in clan activity).
   - **Outcome That Matters:** Backend verifies task completion and credits user wallet with XP (level progress) and newly minted Qabi currency.

3. **Journey 3: Digital Economy & Peer-to-Peer Transactions**
   - **First Touch:** User accesses their Qabi balance wallet.
   - **Action:** Selects a fellow clan member, enters transfer amount and memo, and authorizes peer-to-peer transfer.
   - **Execution:** Platform processes atomic balance deduction from sender and credit to recipient.
   - **Outcome That Matters:** Real-time ledger reconciliation with zero double-spend, updating both users' wallet states instantaneously with logged audit trail.

4. **Journey 4: Timed Hunt Auctions & Real Reward Fulfillment**
   - **First Touch:** User explores active timed auctions in the Hunt Market (`/hunts`).
   - **Action:** Evaluates item (physical merchandise, gift cards, experiences) and places a competitive Qabi bid.
   - **Execution:** Bid amount is locked in escrow; if outbid, funds are returned immediately; when timer expires, highest bidder wins.
   - **Outcome That Matters:** Auction finalizes; winner's Qabi is settled; shipping or digital claim voucher is dispatched.

5. **Journey 5: Reputation, Level Progression & Hall of Fame**
   - **First Touch:** User continuously completes missions, earns XP, and contributes to clan reputation.
   - **Action:** Level boundaries are crossed (e.g. advancing from Initiate to Warrior / Elite Warrior).
   - **Outcome That Matters:** Unlocks gated clan halls, unlocks higher tier hunts, and updates global and clan Hall of Fame rankings.

---

## 2. Top 3 Product Risks (Unique to Qabiile)

1. **Risk 1 (Economic Abuse & Concurrent Double-Spending):**
   Race conditions in simultaneous high-frequency Qabi bidding or peer transfers leading to negative balances, unbacked currency inflation, or duplicate real-world reward fulfillment during auction close.

2. **Risk 2 (Sybil Attacks & Multi-Account Invitation Farming):**
   Coordinated automated bot accounts bypassing invitation gating to exploit referral/mission sign-up Qabi incentives and manipulate clan voting or auction pricing.

3. **Risk 3 (Untrusted Client-Side State & Client Manipulation):**
   Client-side manipulation of mission completion criteria, countdown auction timers, or balance displays without strict server-side cryptographic and transaction-level reconciliation.
