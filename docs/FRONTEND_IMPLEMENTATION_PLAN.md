# VALOIR Frontend Implementation Plan

## Audit
- Prior `frontend/` had only `package.json` and empty folders.
- Backend APIs: `/api/v1/auth/*`, `/api/v1/admin/*` (metrics, boutiques, products, orders, users, disputes, audit), Stripe webhook, SignalR hub.
- **No public catalog, cart, checkout, review, or seller product CRUD endpoints.**

## Architecture
- Vite + React 18 + TypeScript + Tailwind + React Router + TanStack Query + Zustand
- i18n EN (default) / AR RTL · theme light/dark · role-based routes

## Sequence delivered
1. Design system + layouts
2. Public marketplace (home, shop+filters, product, brands, categories)
3. Auth (buyer/seller register, login)
4. Cart/wishlist (local persistence)
5. Admin dashboard wired to real admin APIs
6. Seller shell + legal pages
7. Gap documentation
