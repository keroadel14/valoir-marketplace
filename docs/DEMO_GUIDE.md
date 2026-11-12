# VALOIR Demo Guide

Portfolio demo data for interviews and local exploration.

## Enable demo seed

In **Development**, `appsettings.Development.json` sets:

```json
"Demo": {
  "Enabled": true,
  "Password": "Demo@Valoir2026!"
}
```

Or environment:

```bash
export VALOIR_DEMO_ENABLED=true
export VALOIR_DEMO_PASSWORD='Demo@Valoir2026!'
```

Production `appsettings.json` keeps `"Demo": { "Enabled": false }`.

Super Admin (preserved seeder):

| Field | Default (local) |
|-------|-----------------|
| Email | `admin@valoir.local` |
| Password | `SuperAdmin@Valoir2026!` |

Override with `SuperAdmin:Email` / `SuperAdmin:Password` or `VALOIR_SUPERADMIN_*`.

## Run migrations + API (seeds on startup)

```bash
dotnet ef database update --project src/Valoir.Infrastructure --startup-project src/Valoir.WebApi
dotnet run --project src/Valoir.WebApi --environment Development
```

On startup:

1. `SuperAdminSeeder` (roles + admin)
2. `DemoDataSeeder` (if `Demo:Enabled`)

**Idempotent:** safe to restart; does not duplicate users, products (`demo-*` slugs), orders (`pi_demo*`), reviews, or notifications.

## Demo accounts (password: `Demo@Valoir2026!`)

### Sellers (Vendor)

| Email | Boutique |
|-------|----------|
| seller1@demo.valoir | Maison Lumière |
| seller2@demo.valoir | Atelier Noir |
| seller3@demo.valoir | Pearl & Thread |
| seller4@demo.valoir | Casa Bellini |

### Buyers

| Email |
|-------|
| buyer1@demo.valoir … buyer7@demo.valoir |

### Super Admin

| Email | Password |
|-------|----------|
| admin@valoir.local | SuperAdmin@Valoir2026! |

## Catalog

- **120** products with slugs `demo-{category}-{nnn}`
- Logical categories (encoded in naming; no separate Category CMS table required):

| Category | Count |
|----------|------:|
| Clothing & Fashion | 20 |
| Shoes | 15 |
| Bags & Accessories | 15 |
| Electronics | 20 |
| Home & Living | 15 |
| Beauty & Personal Care | 15 |
| Watches & Jewelry | 10 |
| Sports & Lifestyle | 10 |

Each product has one variant (SKU + stock). Featured every 11th product.

## Orders & lifecycle

Eight demo orders with PaymentIntent ids `pi_demo_*` covering:

Paid · Processing · Shipped · Delivered · Cancelled

Multi-vendor lines when items belong to different boutiques.

## Reviews

Created only for **Delivered** vendor-order lines (verified purchase rules).

## Notifications

Welcome + order-style demo notifications for the first five buyers (`type` starts with `demo.`).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Browse `/shop` — data comes from `GET /api/v1/catalog/products` after seed.

## Safe re-seed

Restart the API with `Demo:Enabled=true`. **No** database drop required. To force a clean catalog only, remove rows where `Products.Slug LIKE 'demo-%'` manually if needed (not required for normal use).

## Limitations

- Images: catalog may use frontend placeholders if no image URLs in schema
- Payments remain **mock** (`pi_demo_*` / `pi_mock_*`)
- Categories are logical labels, not a full Category entity browser unless added later
