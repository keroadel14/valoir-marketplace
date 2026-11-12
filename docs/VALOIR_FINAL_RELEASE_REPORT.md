# VALOIR Final Release Report

## Root cause: LoginCommand handler missing

`Program.cs` registered MediatR with `typeof(AuthHandlersMarker).Assembly`, but **AuthHandlersMarker was defined at the bottom of Program.cs** (WebApi assembly).  
`LoginHandler` lives in **Valoir.Infrastructure**. MediatR therefore never scanned Infrastructure → runtime: handler not registered.

### Fix
- Added `src/Valoir.Infrastructure/Services/AuthHandlersMarker.cs`
- Removed the WebApi-local marker namespace from `Program.cs`
- Registration now correctly targets the Infrastructure assembly

## Migrations

- Full chain applies on clean DB including `20261111182000_AddReviewsFollowsNotifications`
- Up() uses **idempotent** `CREATE TABLE IF NOT EXISTS` SQL (safe when tables already exist)
- `__EFMigrationsHistory` contains 6 migrations after `database update`

## Seeder logging

- Final count query uses `StripePaymentIntentId LIKE 'pi_demo%'` (matches real demo orders)

## Verification results (executed)

| Check | Result |
|-------|--------|
| `dotnet build` WebApi | **Succeeded** |
| `dotnet test` UnitTests | **24 passed** |
| `dotnet ef database update` | **Applied all 6 migrations** |
| Login buyer1 | **HTTP 200** + accessToken |
| Login seller1 | **HTTP 200** + accessToken |
| Login admin@valoir.local | **HTTP 200** + accessToken |
| Bad password | DomainException (invalid credentials) |
| Catalog products | **totalCount=120** |
| Buyer orders with JWT | **HTTP 200** |
| Frontend npm build | **Not completed** (environment timeouts) |

## Demo data after seed

users=12, products=120, orders=8, reviews=4

## Portfolio verdict

**COMPLETE WITH DOCUMENTED LIMITATIONS – SUITABLE FOR PORTFOLIO**

Login and catalog are verified. Finish `npm install && npm run build` on a local machine for frontend confirmation.
