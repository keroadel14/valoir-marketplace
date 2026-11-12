# VALOIR Phase 6 – Database Migration & PostgreSQL Verification

**Date:** 2026-11-11  
**Scope:** Reconcile EF Core model with migration history; generate `AddProcessedStripeEvent`; review PostgreSQL compatibility (Outbox SKIP LOCKED, indexes, financial precision).

## 1. Repository Audit Findings

| Item | Status |
|------|--------|
| `InitialCreate` migration present | Yes (`20261111153033_InitialCreate`) |
| `ProcessedStripeEvent` entity + DbContext config | Present in model |
| `ProcessedStripeEvent` in `InitialCreate` / prior snapshot | **Missing** (gap from Phase 5) |
| Auto-migrate on application startup | **Not present** (safe) |
| Connection strings | appsettings only; no production secrets committed |
| Soft-delete query filters | Boutiques, Products configured |
| Decimal money columns | `numeric(18,2)` |
| Commission rate | `numeric(5,4)` |

## 2. Migration Generated

**Name:** `20261111161941_AddProcessedStripeEvent`

**Up() changes only:**
- Create table `ProcessedStripeEvents`
- Columns: `Id` (uuid PK), `EventId` (varchar 128), `EventType` (varchar 120), `ProcessedAt` (timestamptz), `Outcome` (text nullable), `CreatedAt`, `UpdatedAt`, `RowVersion`
- Unique index `IX_ProcessedStripeEvents_EventId`

**No unintended schema changes.** InitialCreate was not modified.

### SQL artifacts
- Full history script: `docs/phase6-migration.sql`
- Incremental only: `docs/phase6-incremental-AddProcessedStripeEvent.sql`

## 3. Outbox / PostgreSQL Compatibility

### Claim pattern (updated in Phase 6)
1. `BEGIN` transaction
2. `SELECT ... FOR UPDATE SKIP LOCKED` (Npgsql only)
3. Mark rows `Processing` + `SaveChanges`
4. `COMMIT` (releases locks)
5. Process Stripe/SignalR **outside** the claim transaction
6. Mark Completed / Failed + DeadLetter after 8 attempts

### FromSqlRaw column list (explicit)
Matches EF mapping for `OutboxMessage` + `BaseEntity`:
`Id, CreatedAt, UpdatedAt, RowVersion, Type, PayloadJson, IdempotencyKey, Status, AttemptCount, ProcessedAt, LastError, NextAttemptAt`

Quoted identifiers use PostgreSQL default EF naming (`"OutboxMessages"`).

### Multi-instance
- Concurrent workers skip locked Pending rows.
- After claim commit, Status=Processing so other workers will not re-select them.
- Non-Npgsql providers use optimistic claim path (InMemory tests).

## 4. Indexes & Constraints (relevant)

| Table | Constraint / Index |
|-------|-------------------|
| ProcessedStripeEvents | UNIQUE EventId |
| OutboxMessages | UNIQUE IdempotencyKey (filtered IS NOT NULL); (Status, NextAttemptAt) |
| VendorLedgerEntries | UNIQUE IdempotencyKey (filtered); BoutiqueId; VendorOrderId |
| Orders | UNIQUE OrderNumber; StripePaymentIntentId; Status |
| Boutiques | UNIQUE Slug; Status; OwnerUserId |
| RefreshTokens | UNIQUE TokenHash |

## 5. Financial Integrity Review

- All monetary fields: `decimal` → PostgreSQL `numeric(18,2)` — **not** float/double.
- Commission rates: `numeric(5,4)`.
- Ledger + Outbox idempotency keys unique when non-null.
- Webhook dedup via `ProcessedStripeEvents.EventId`.
- Financial history tables do not cascade-delete via soft-delete of products/boutiques in a way that drops ledger rows (ledger is independent FK by Guid, no cascade configured to purge history).

## 6. Testing

| Check | Result |
|-------|--------|
| `dotnet build` (WebApi) | Succeeded 0 errors |
| Unit tests (Boutique + OutboxMessage) | **13 passed** |
| Integration tests / Testcontainers | **Skipped** — no Docker/PostgreSQL in environment |
| `dotnet ef database update` against live PG | **Not executed** — PostgreSQL unavailable |

## 7. Staging Deployment Commands

```bash
# From repo root
dotnet restore
dotnet build

# Review incremental SQL first
cat docs/phase6-incremental-AddProcessedStripeEvent.sql

# Apply (staging/dev only — never auto on production startup)
export ConnectionStrings__DefaultConnection='Host=...;Database=valoir;Username=...;Password=...'
dotnet ef database update \
  --project src/Valoir.Infrastructure \
  --startup-project src/Valoir.WebApi

# Verify
# SELECT * FROM "__EFMigrationsHistory";
# \d "ProcessedStripeEvents"
```

## 8. Known Limitations / Blockers

1. Runtime application of migrations against PostgreSQL **not verified** in this environment.
2. Concurrent Outbox SKIP LOCKED behavior **not load-tested** against multi-instance Postgres.
3. Integration test project still uses InMemory; Testcontainers Postgres not wired.
4. `Outcome` column is unbounded `text` — acceptable for v1; can cap length later if needed.

## 9. Readiness

Database model and migration history are reconciled. Backend is ready for Admin Dashboard integration once migrations are applied on a real staging PostgreSQL instance.
