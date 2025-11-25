# Project Description

**Deployed Frontend URL:** [https://tip-sol-warrior.vercel.app/](https://tip-sol-warrior.vercel.app/)

**Solana Program ID:** `uQFxxGURSSagfwpeEx8DQT1yLbLiqfuMAqLsjWYKbJA`

## Project Overview

### Description

Tip is a non-custodial tipping platform for the Solana ecosystem. Builders can deploy their own vault PDA in a single click, receive direct SOL tips through personalized landing pages, and withdraw proceeds at any time. Supporters experience an inviting interface with preset amounts, real-time vault telemetry, and immediate explorer links. A public leaderboard and builder discovery flow highlight the most-supported creators so the community can surface high-signal builders quickly.

### Key Features

- **One-click vault activation:** Builders initialize a PDA-backed vault tied to their wallet, no manual address management is required.
- **Shareable tip journeys:** Every vault exposes a unique `/tip/[vault]` page plus copy-to-clipboard helpers and direct links for social sharing.
- **Instant SOL tipping & receipts:** Supporters pick preset amounts, sign once, and receive transaction signatures with direct Explorer links.
- **Builder analytics & guardrails:** Dashboards show wallet status, setup progress, total tips, withdrawable balances, and enforce thresholds to prevent rent-draining withdrawals.
- **Community leaderboard:** The “Top 10 Builder” table consumes on-chain data to showcase which vaults attract the most SOL, giving social proof to new supporters.

### How to Use the dApp

1. **Connect Wallet:** Use the global wallet adapter on the homepage or Builder Dashboard.
2. **Activate Builder Vault:** Builders hit “Activate Tip Vault,” which derives and initializes their PDA-backed vault account on-chain.
3. **Share Tip Link:** Copy the vault address or auto-generated `/tip/[vault]` link and share it publicly; supporters can also search via the Tipper discovery page.
4. **Send Tips:** Supporters open the tip page, choose a preset amount (0.05–0.5 SOL or custom), confirm in their wallet, and see a success card with the transaction signature.
5. **Withdraw Funds:** Builders revisit the dashboard and withdraw any balance above the rent-exempt threshold back to their creator wallet.
6. **Monitor Activity:** Builders track totals and availability, while the community reviews the “Top 10 Builder” leaderboard fed by the same on-chain data.

## Program Architecture

The Anchor program is intentionally lean, centering on a single `Vault` account that stores the creator’s public key, PDA bump, and cumulative tips. Deterministic PDAs ensure every builder has exactly one vault, while CPI calls to the System Program move lamports into PDAs. Withdrawals perform rent-aware transfers back to the creator wallet. Events are emitted for initialization, deposits, and withdrawals so indexers or analytics services can subscribe without parsing raw logs.

### PDA Usage

All PDAs are derived from the seed tuple `["vault", creator_pubkey]` under the deployed program ID. This pattern guarantees:

- **Uniqueness:** Each creator wallet maps to one vault PDA, preventing duplicate deposits.
- **Determinism:** Both the frontend and client helpers can derive vault addresses offline for sharing and validation.
- **Security:** The `bump` is persisted on-chain and validated in every instruction, ensuring only the legitimate PDA can be mutated.

**PDAs Used:**

- **Creator Vault PDA:** `seeds = [b"vault", creator.key().as_ref()]`, `bump` stored in the account. Holds tips and enforces the creator/withdraw relationship.

### Program Instructions

- **`init_vault`** – Initializes the creator’s vault PDA, stores the owner and bump, zeroes `total_tips`, and emits `InitVaultEvent`.
- **`deposit_tip(amount: u64)`** – Transfers lamports from the sender to the creator’s vault via the System Program, checks balances/overflow, updates `total_tips`, and emits `TipDeposited`.
- **`withdraw_tip`** – Verifies the signer owns the vault, keeps the PDA rent-exempt, and transfers available lamports back to the creator while emitting `TipWithdrawEvent`.

### Account Structure

```rust
#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub creator: Pubkey,  // Wallet that owns and can withdraw from this vault
    pub bump: u8,         // PDA bump used for address re-derivation
    pub total_tips: u64,  // Cumulative lamports tipped into the vault
}
```

## Testing

### Test Coverage

`anchor_project/tests/anchor_project.ts` delivers comprehensive coverage across initialization, deposits, withdrawals, and end-to-end flows. Each test suite funds local wallets, derives PDAs, and asserts on both on-chain account data and lamport balances to ensure safety checks hold.

**Happy Path Tests:**

- **Initialize Vault:** Ensures PDA derivation, ownership, and zeroed `total_tips`.
- **Deposit Tip:** Covers single and multiple deposits, balance deltas, and zero-amount handling.
- **Withdraw Tip:** Confirms only the owner can withdraw and that rent handling leaves the PDA rent-exempt.
- **Full Flow:** Runs init → deposit twice → withdraw to simulate a real builder journey.

**Unhappy Path Tests:**

- **Duplicate Initialization:** Rejected with “account already in use.”
- **Deposit Failures:** Includes insufficient funds, exceeding balance, and rent-threshold violations.
- **Withdrawal Failures:** Tests empty vaults, rent-only vaults, and non-existent PDAs to guarantee safety checks.

### Running Tests

```bash
cd anchor_project
pnpm install   # installs TS/Mocha deps (first run only)
anchor test    # builds program and executes the full suite
```

### Additional Notes for Evaluators

- Program events (`InitVaultEvent`, `TipDeposited`, `TipWithdrawEvent`) make it trivial to plug analytics providers or indexers into the flow.
- Frontend helpers (`getCreatorVaultAccount`, `getAllVaultAccount`, `checkCreatorVaultAccount`) are thin wrappers around Anchor RPC calls, showing how the program can be composed into other apps.
- The UI guides builders through connection → activation → sharing → withdrawal, which prevents common mistakes (trying to tip an uninitialized vault, withdrawing below rent, etc.) and mirrors the contract’s safety checks.
