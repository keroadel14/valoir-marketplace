# VALOIR Project Status

**Portfolio readiness:** COMPLETE WITH DOCUMENTED LIMITATIONS

## Verified (this release)

- Login (Buyer / Seller / SuperAdmin) via MediatR — **fixed** AuthHandlersMarker assembly registration
- JWT access to `/api/v1/buyer/orders`
- Catalog API `totalCount=120`
- EF migrations including `AddReviewsFollowsNotifications` (idempotent SQL)
- Demo seeder idempotent; order count log uses `pi_demo` prefix
- Unit tests: 24 passed
- Backend build: succeeded

## Known limitations

- Invalid login may surface as HTTP 500 DomainException (not polished 401)
- Frontend `npm install`/`build` not verified in CI sandbox
- Stripe payments remain mock/demo mode
- Demo seed only when `Demo:Enabled=true` (off in production appsettings)
