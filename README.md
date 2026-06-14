# nest-postgres-crud

NestJS API with PostgreSQL (Prisma 7), Redis sessions, cookie-based auth, and Docker support.

## Stack

- **NestJS 11** — HTTP API
- **Prisma 7** + **PostgreSQL** — user persistence
- **Redis** — session storage (7-day TTL)
- **bcrypt** — password hashing
- **Jest + Supertest** — unit and E2E tests

## Prerequisites

- Node.js 22+
- Docker (for Postgres and Redis)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `CORS_ORIGIN` | Comma-separated allowed origins (optional; has defaults) |

The app validates required env vars at startup and exits if they are missing.

### 3. Start infrastructure

```bash
npm run docker:up
```

Starts Postgres and Redis via Docker Compose.

### 4. Run migrations

```bash
npx prisma migrate deploy
```

### 5. Start the app

```bash
npm run start:dev
```

API runs at `http://localhost:3000`.

## Docker

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Postgres + Redis |
| `npm run docker:down` | Stop containers |
| `npm run docker:app` | Full stack (app + Postgres + Redis) |

When the app runs **inside Docker**, connection strings use service hostnames (`postgres`, `redis`). When it runs **on the host**, use `localhost` (see `.env.example`).

## API

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Checks Postgres and Redis; returns `503` if either is down |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | No | Register (rate limited) |
| `POST` | `/auth/login` | No | Login; sets `sid` httpOnly cookie |
| `POST` | `/auth/logout` | No | Clears session and cookie |
| `GET` | `/auth/me` | Session | Current user |

### Users (own account only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/:id` | Session + owner | Get profile |
| `PATCH` | `/users/:id` | Session + owner | Update profile; refreshes session |
| `DELETE` | `/users/:id` | Session + owner | Delete account; clears session |

Use `api.http` for manual requests (VS Code REST Client or similar).

## Tests

```bash
# Unit tests (no Docker required)
npm test

# E2E tests (requires Postgres + Redis)
npm run docker:up
npx prisma migrate deploy
npm run test:e2e

# Both
npm run test:all
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start:prod` | Run compiled app |
| `npm run prisma:generate` | Generate Prisma client |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | ESLint |

## Project structure

```
src/
  auth/          # Signup, login, logout, session guard
  users/         # Profile CRUD (owner-only)
  health/        # /health readiness checks
  config/        # Env validation
  prisma/        # Prisma service
  redis/         # Redis service
  common/        # Shared helpers
prisma/          # Schema and migrations
test/            # E2E tests and helpers
```

## License

UNLICENSED — private project.
