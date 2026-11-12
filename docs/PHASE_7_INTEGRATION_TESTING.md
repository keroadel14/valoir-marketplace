# VALOIR Phase 7 – Integration Testing & Reliability Hardening

**Date:** 2026-11-11

## 1. Test Architecture

- **Unit tests:** `tests/Valoir.UnitTests` (domain, validators, Outbox state machine)
- **Integration tests:** `tests/Valoir.IntegrationTests`
  - `Infrastructure/DockerAvailability.cs` – soft-skip when Docker missing
  - `Infrastructure/PostgresRedisFixture.cs` – Testcontainers PostgreSQL 16 + Redis 7
  - Collection fixture `[Collection("PostgresRedis")]` shared containers
- **WebApplicationFactory** retained for auth smoke tests (InMemory host) when containers absent
- **CI:** `.github/workflows/ci.yml` runs unit + integration on `ubuntu-latest` with Docker

## 2. Reliability Fix (Outbox crash recovery)

**Defect:** Messages claimed (`Status=Processing`) then worker crash were never reclaimed.

**Fix:**
- Domain: `OutboxMessage.ProcessingStartedAt` + `ProcessingLease` (5 minutes) + `IsStaleProcessing`
- Processor claim SQL includes stale Processing rows
- Migration: `AddOutboxProcessingLease` adds column only

Stripe external calls remain **at-least-once**; exactly-once relies on Stripe idempotency keys.

## 3. Migrations (history)

1. `20261111153033_InitialCreate`
2. `20261111161941_AddProcessedStripeEvent`
3. `*AddOutboxProcessingLease` (ProcessingStartedAt)

## 4. Tests Implemented

| Category | Tests | Requires Docker |
|----------|-------|-----------------|
| Migration fresh apply + history | Yes | Yes |
| Unique EventId | Yes | Yes |
| Outbox idempotency unique | Yes | Yes |
| Transaction rollback | Yes | Yes |
| Concurrent SKIP LOCKED claim | Yes | Yes |
| Stale Processing reclaim | Yes | Yes |
| DeadLetter after 8 attempts | Yes | No (domain) |
| Outbox lease unit tests | Yes | No |
| Auth integration (InMemory factory) | Existing | No |

## 5. Execution Environment Notes

Sandbox used for Phase 7 had **no Docker**. Container tests are written to **return early** when `DockerAvailability.IsAvailable == false` (not fail). CI with Docker will execute them for real.

## 6. Commands to reproduce

```bash
dotnet restore
dotnet build
dotnet test tests/Valoir.UnitTests
# Requires Docker:
dotnet test tests/Valoir.IntegrationTests
```

## 7. Remaining blockers

1. Execute integration suite on a Docker-enabled host/CI and capture pass counts.
2. Expand webhook HTTP tests against WebApplicationFactory + real Postgres.
3. Redis inventory concurrency tests (fixture ready; cases pending expansion).
4. SignalR client tests against authenticated hub.

## 8. Next phase recommendation

After CI shows green integration results on Docker, proceed to **Phase 8 – Stripe End-to-End (test mode)**.
