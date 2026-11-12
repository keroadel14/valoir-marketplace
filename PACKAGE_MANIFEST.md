# VALOIR Package Manifest

**Archive:** `VALOIR-Portfolio-Project.zip`  
**Purpose:** Portfolio / GitHub / CV — not commercial production.

## Included major modules

| Path | Description |
|------|-------------|
| `Valoir.sln` | Solution file |
| `src/Valoir.Domain` | Domain entities & rules |
| `src/Valoir.Application` | CQRS commands/queries/handlers contracts |
| `src/Valoir.Infrastructure` | EF Core, Identity, Stripe mock, Redis, Outbox, Seeders |
| `src/Valoir.WebApi` | HTTP API, SignalR hub, Program.cs |
| `frontend/` | React 18 + Vite + TypeScript + Tailwind |
| `tests/Valoir.UnitTests` | Unit tests |
| `tests/Valoir.IntegrationTests` | Integration test project |
| `docs/` | Architecture, demo guide, phase reports, API overview |
| `.github/workflows/` | CI workflow if present |
| `.env.example` | Safe env template |
| `README.md` | Setup instructions |

## Intentionally excluded (regenerable)

- `**/bin/`, `**/obj/`
- `frontend/node_modules/`
- `frontend/dist/`
- `**/*.log`
- `.git/` (no history was present in source workspace)

## Verification notes

- Source `.cs` files (excluding obj): present under `src/`
- Migrations including `AddReviewsFollowsNotifications`: included
- `DemoDataSeeder` + `SuperAdminSeeder`: included
- Demo credentials documented in `docs/DEMO_GUIDE.md` (local demo only)

## Restore after extract

```bash
# Backend
dotnet restore Valoir.sln
dotnet ef database update --project src/Valoir.Infrastructure --startup-project src/Valoir.WebApi
dotnet run --project src/Valoir.WebApi --environment Development

# Frontend
cd frontend && npm install && npm run dev
```
