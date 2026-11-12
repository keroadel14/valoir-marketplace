# VALOIR Phase 7.1 – Integration Verification & Critical Reliability Fixes

## 1. Scope
Verify and harden Outbox lease ownership, retries/DeadLetter, PostgreSQL migrations, Redis inventory concurrency, Stripe webhook atomicity, and CI fail-closed behavior before Phase 8.

## 2. Initial Audit Findings
| Issue | Severity |
|-------|----------|
| No LeaseToken fencing – stale worker could MarkCompleted after reclaim | **Critical** – fixed |
| Webhook business SaveChanges separate from ProcessedStripeEvent insert | **High** – fixed (single transaction + unique claim) |
| Redis reserve used INCR then check (ok on Redis single-thread) but not Lua | **Medium** – improved with Lua |
| Integration tests soft-skipped without Docker; CI could go green | **High** – CI sets VALOIR_REQUIRE_DOCKER=1 |
| ProcessingLease was 5 minutes | Raised to **10 minutes** for Stripe latency |

## 3. Outbox Ownership Design
- **Claim:** `Claim()` assigns new `Guid LeaseToken`, sets Processing, AttemptCount++, ProcessingStartedAt=UtcNow
- **Claim query:** Pending due OR Processing with ProcessingStartedAt <= now - lease; `FOR UPDATE SKIP LOCKED`
- **Finalize:** `TryFinalizeAsync` runs conditional SQL:
  `UPDATE ... WHERE Id=@id AND LeaseToken=@token AND Status=Processing`
  Returns false if 0 rows (stale worker)
- **Lease duration:** 10 minutes – covers Stripe API + retries; external ops still use Stripe idempotency keys (at-least-once)

## 4. Retry / DeadLetter
- Max attempts **8** → DeadLetter
- Failed (with valid lease) → Pending + exponential backoff
- Stale finalize does **not** increment AttemptCount
- DeadLetter / Completed not selected by claim query

## 5. Migrations
1. InitialCreate  
2. AddProcessedStripeEvent  
3. AddOutboxProcessingLease (`ProcessingStartedAt`)  
4. **AddOutboxLeaseToken** (`LeaseToken` uuid nullable) – Phase 7.1

## 6. Stripe Webhook Atomicity
- Begin transaction  
- Insert ProcessedStripeEvent first (unique EventId acts as claim)  
- Apply business mutations (no nested SaveChanges)  
- Commit once  
- Concurrent duplicate → unique violation → rollback → HTTP 200 `{status:duplicate}`  
- Transient errors → rollback, **not** recorded as processed → HTTP 500 for Stripe retry  

## 7. CI
`VALOIR_REQUIRE_DOCKER=1` and `CI=true` on integration job. `DockerAvailability.EnsureAvailableOrThrow()` fails suite if Docker missing in CI. Local soft-skip remains when env unset.

## 8. Commands
```bash
dotnet build
dotnet test tests/Valoir.UnitTests
VALOIR_REQUIRE_DOCKER=1 dotnet test tests/Valoir.IntegrationTests   # requires Docker
```

## 9. Actual Test Results (this environment)
- Unit (Boutique + Outbox): **17 passed**, 0 failed (executed)
- PostgreSQL / Redis / SKIP LOCKED / webhook HTTP: **NOT EXECUTED** (Docker unavailable)
- CI workflow run: **PENDING** (no GitHub Actions runner here)

## 10. Final readiness
**IMPLEMENTED BUT NOT VERIFIED** for container-backed paths. Do not start Phase 8 until Docker/CI green.
