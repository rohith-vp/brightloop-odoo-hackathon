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

```bash
docker compose run --rm api npm test
```

Or locally, with Node 22+ and `cd backend && npm install`:

```bash
cd backend && npm test
```

### Backend layout

```
backend/
├── src/
│   ├── index.js        # Startup and graceful shutdown
│   ├── app.js          # Express app: middleware, routes, error handling
│   ├── config.js       # Environment variable validation (Zod)
│   ├── db.js           # PostgreSQL connection pool
│   └── routes/         # One file per resource
└── test/
```

New routes go in `src/routes/`, and are mounted in `src/app.js`.
