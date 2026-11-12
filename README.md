# VALOIR — Luxury Multi-Vendor Marketplace

**Portfolio Full-Stack project** demonstrating a production-style multi-vendor e-commerce architecture.

VALOIR is a bilingual (English / Arabic) luxury marketplace where independent boutiques sell curated fashion, jewelry, and design goods. The platform combines a React storefront with a .NET 8 Clean Architecture backend, JWT auth, multi-vendor orders, inventory holds, and an Outbox pattern for reliable side-effects.

> **Status:** *Complete with documented limitations* — suitable for GitHub portfolio and technical interviews. Not a live commercial production deployment.

## Highlights

- **Clean Architecture** (.NET 8): Domain · Application (CQRS/MediatR) · Infrastructure · WebApi  
- **Multi-vendor orders** with per-boutique `VendorOrder`, commission snapshot (default 12%)  
- **Public catalog** (Published products from Approved boutiques only)  
- **Checkout** with server-side totals, 10-minute inventory reservation, mock PaymentIntent  
- **Seller fulfillment**: process → ship with tracking → buyer notification  
- **Verified purchase reviews** (server-enforced eligibility)  
- **Follow boutiques** + persistent **notifications**  
- **Admin** boutique lifecycle, product moderation, platform metrics  
- **Outbox** with PostgreSQL `FOR UPDATE SKIP LOCKED` and lease-token fencing  
- **Frontend**: React + Vite + TypeScript + Tailwind, EN/AR RTL, Light/Dark  

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Backend | .NET 8, EF Core, PostgreSQL, Redis, MediatR, FluentValidation, Identity + JWT, SignalR, Stripe abstractions |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, Axios, React Router |
| Patterns | Clean Architecture, CQRS, Transactional Outbox, RBAC |

## Architecture (short)

```
WebApi  →  Application (commands/queries)  →  Domain
                ↓
         Infrastructure (EF, Redis, Stripe mock/live, Outbox worker)
```

## Main modules

- **Auth** — register buyer / vendor, login, refresh rotation, logout  
- **Catalog** — public product list/detail, boutique profile, reviews  
- **Buyer** — addresses, create order, order history, follows, notifications  
- **Seller** — products, order list, process/ship  
- **Admin** — metrics, boutiques approve/suspend, products feature/unlist  

## Demo data

See **[docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)** for 120 products, sellers, buyers, and login credentials.

## Quick start

### Prerequisites

- .NET 8 SDK  
- Node.js 18+  
- PostgreSQL 16 (and Redis recommended)  

### Backend

```bash
cd src/Valoir.WebApi
# appsettings or env:
# ConnectionStrings__Default=Host=localhost;Database=valoir;Username=...;Password=...
# Jwt__Key=... (min 32 chars)
# Stripe__SecretKey= (optional — mock mode without it)

dotnet ef database update --project ../Valoir.Infrastructure --startup-project .
dotnet run
```

API base: `http://localhost:5xxx/api/v1`  
Swagger if enabled in Development.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` and `/hubs` to the backend (see `vite.config.ts`).

### Demo payment mode

Without Stripe keys, PaymentIntents and refunds use **explicit mock IDs** (`pi_mock_…`).  
Orders are **not** marked paid by the mock alone; webhook handling exists for real/test events.  
Document this clearly in interviews: totals and inventory holds are real application logic; card charging is demo-mode without credentials.

## Testing

```bash
dotnet test tests/Valoir.UnitTests
# Integration tests require Docker (Testcontainers):
# VALOIR_REQUIRE_DOCKER=1 dotnet test tests/Valoir.IntegrationTests
```

## Documentation

| Doc | Path |
|-----|------|
| Project status | [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) |
| API overview | [docs/API_OVERVIEW.md](docs/API_OVERVIEW.md) |
| Final release report | [docs/VALOIR_FINAL_RELEASE_REPORT.md](docs/VALOIR_FINAL_RELEASE_REPORT.md) |

## Known limitations

- Stripe **live** charges require real keys (mock otherwise).  
- Integration tests need Docker (not always available in CI without services).  
- Categories/brands are simplified (not full CMS).  
- Image upload / CDN not implemented.  
- Frontend production `npm run build` should be verified on your machine after `npm install`.  

## License

Portfolio / educational use. Not affiliated with any commercial brand named similarly.
