# Frontend ↔ Backend API Gaps

## Integrated (real backend)
| Method | Route | UI |
|--------|-------|-----|
| POST | /api/v1/auth/register-buyer | Register buyer |
| POST | /api/v1/auth/register-vendor | Register seller |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Axios interceptor |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/admin/metrics | Admin overview |
| GET/POST | /api/v1/admin/boutiques* | Admin boutiques |
| GET/POST | /api/v1/admin/products* | Admin products |

## Demo / local only (not production data)
- Public product list/detail when user is not admin → labeled demo fixtures in `catalogApi`

## Missing public APIs (block production catalog)
- GET /api/v1/catalog/products (filters, pagination, sort)
- GET /api/v1/catalog/products/{slug}
- GET /api/v1/catalog/categories
- GET /api/v1/catalog/brands
- GET /api/v1/boutiques/{slug} (public store)
- Cart/checkout PaymentIntent
- Buyer orders, reviews eligibility
- Seller product CRUD
- Follow seller / notifications list
- Wishlist server sync

## Authorization note
Admin UI requires Admin/SuperAdmin JWT. Demo catalog is for UI development only.

## Updated (session completion)
- GET /api/v1/catalog/products — **IMPLEMENTED**
- GET /api/v1/catalog/products/{slug} — **IMPLEMENTED**
- GET /api/v1/catalog/boutiques/{slug} — **IMPLEMENTED**
- GET/POST /api/v1/seller/products — **IMPLEMENTED**
