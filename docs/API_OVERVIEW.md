# VALOIR API Overview (v1)

Base path: `/api/v1`

## Auth
- POST `/auth/register-buyer`
- POST `/auth/register-vendor`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`

## Catalog (anonymous)
- GET `/catalog/products`
- GET `/catalog/products/{slug}`
- GET `/catalog/boutiques/{slug}`
- GET `/catalog/products/{productId}/reviews`

## Buyer (Authorize)
- CRUD `/buyer/addresses`
- GET/POST `/buyer/orders`
- POST `/buyer/reviews`
- GET/POST/DELETE `/buyer/follows…`
- GET/POST `/buyer/notifications…`

## Seller (Vendor+)
- GET/POST `/seller/products`
- GET `/seller/orders`
- GET `/seller/orders/{vendorOrderId}`
- POST `/seller/orders/{id}/process`
- POST `/seller/orders/{id}/ship`

## Admin (Admin+)
- GET `/admin/metrics`
- Boutiques approve/suspend…
- Products feature/unlist…
- Orders, users, audit, disputes

## Webhooks
- POST `/webhooks/stripe`
