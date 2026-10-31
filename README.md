# brightloop-odoo-hackathon

Subscription management system for Brightloop Software.

## Run with Docker

Requirements: Docker with Compose v2.

```bash
cp .env.example .env        # then set POSTGRES_PASSWORD and JWT_SECRET to local values
docker compose up --build
```

| Service | URL / port | Notes |
|---|---|---|
| Web (React + Vite) | http://localhost:5173 | Hot reload from `frontend/` |
| API (Express) | http://localhost:8000/api | Health check at `/api/health` |
| PostgreSQL 16 | localhost:5432 | User, password, and DB from `.env` |

Stop with `docker compose down`. Database data persists in the `postgres_data` volume. To wipe it, run `docker compose down -v`.

### When dependencies change

The web container keeps `node_modules` in a named volume, so a new package needs that volume rebuilt:

```bash
docker compose build web
docker volume rm brightloop_web_node_modules
docker compose up web
```

### Connecting to the database

```bash
docker compose exec db psql -U brightloop -d brightloop
```

### Checking the API

```bash
curl http://localhost:8000/api/health
# {"data":{"status":"ok","database":"up"}}
```

A 503 response means the API is running but cannot reach PostgreSQL.

### Running backend tests

Unit tests need no database:

```bash
docker compose run --rm api npm test
```

Integration tests run the catalog endpoints against PostgreSQL. They truncate tables, so the database name must contain `test`. Create one in the `db` container, then pass its URL (use the password from your `.env`):

```bash
docker compose exec db createdb -U brightloop brightloop_test
docker compose run --rm -e TEST_DATABASE_URL=postgresql://brightloop:<password>@db:5432/brightloop_test api npm test
```

Without `TEST_DATABASE_URL`, the integration tests are skipped.

Or locally, with Node 22+ and `cd backend && npm install`, run `npm test` in `backend/`.

### Backend layout

```
backend/
├── migrations/         # SQL files, applied in filename order on startup
├── src/
│   ├── index.js        # Startup, migrations, and graceful shutdown
│   ├── app.js          # Express app: middleware, routes, error handling
│   ├── config.js       # Environment variable validation (Zod)
│   ├── db.js           # PostgreSQL connection pool
│   ├── migrate.js      # Applies pending migrations, once each
│   ├── auth.js         # Role checks: requireAuth, requireRole
│   ├── errors.js       # ApiError and PostgreSQL error mapping
│   ├── validation.js   # Zod helpers and pagination
│   ├── schemas/        # Request validation (products, variants, plans)
│   ├── repositories/   # Shared SQL queries
│   └── routes/         # One file per resource
└── test/
    ├── unit/           # No database
    └── integration/    # Needs TEST_DATABASE_URL
```

New routes go in `src/routes/`, and are mounted in `src/app.js`.

### Billing

Subscriptions go through Draft, Confirmed, Active, and Closed, and each step is checked on the server. Only Active subscriptions are billed.

Create the invoices due as of a date (safe to repeat):

```bash
curl -X POST http://localhost:8000/api/billing/run \
  -H "Authorization: Bearer <admin-or-staff-token>" \
  -H "Content-Type: application/json" \
  -d '{"as_of": "2026-10-15"}'
```

The billing rules live in `packages/billing`, which the API imports through `backend/src/billing.js`. Docker Compose mounts that folder at `/packages`. See `docs/api.md` section 5.

### Catalog endpoints

Products, variants, and plans are implemented in `src/routes/`. Reads need a signed-in user. Writes need the Admin or Staff role. Signed-in auth is not merged yet, so these endpoints return 401 until it is. See `docs/api.md`.
