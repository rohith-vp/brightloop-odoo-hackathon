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

## Services not yet in this stack

The API (`apps/api`) is not in the repo yet. When it is, add an `api` service to `docker-compose.yml` and set `DATABASE_URL` to use host `db`, as already shown in `.env.example`.
