# Pokémon Collection

[![CI](https://github.com/classicABCD/mercedes-coding-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/classicABCD/mercedes-coding-challenge/actions/workflows/ci.yml)

Full-stack application in which trainers manage their personal Pokémon collection.

**Stack:** Java 25 + Spring Boot 4 (modular monolith) · React + Mantine + RTK Query (TypeScript) · PostgreSQL ·
Liquibase · OpenAPI (specification first) · Docker Compose

## Getting Started

**Requirement:** Docker with Docker Compose. No local Java or Node.js installation is needed.

```bash
docker compose up --build
```

Open **http://localhost:3000** and register a trainer.

- On the first start the backend loads ~1,350 Pokémon from [PokéAPI](https://pokeapi.co) in the background (about a
  minute). The catalog fills automatically; the app is usable during the sync.
- Afterwards all data comes from the local database; the app also works while PokéAPI is unavailable.
- Stop with `docker compose down`. Data is kept in a Docker volume; `docker compose down -v` removes it.
- Start with `APP_PORT=8081 docker compose up --build` to specify your own port.

## Documentation

- [Architecture & decisions](docs/architecture.md) – quality goals, building blocks, ADRs, risks
- [API contract](api/openapi.yaml) – OpenAPI specification, source for backend interfaces and frontend client

## Local Development

**Requirements:** Java 25, Node.js 24, Docker (for PostgreSQL and the Testcontainers tests). Maven is provided via the
wrapper (`mvnw`).

```bash
# 1. PostgreSQL on localhost:5432
docker compose -f docker-compose.yml -f compose.dev.yaml up -d postgres

# 2. Backend on http://localhost:8080
cd backend && ./mvnw spring-boot:run

# 3. Frontend on http://localhost:5173 (proxies /api to the backend)
cd frontend && npm install && npm run dev
```

API code is generated from `api/openapi.yaml` on every build (`mvnw` for the backend, `npm run dev|build|test` for the
frontend). API changes start in the spec.

## Tests & Linting

```bash
cd backend && ./mvnw verify             # Spotless check + unit, integration (Testcontainers), WireMock, module tests – Docker required
cd backend && ./mvnw spotless:apply     # format Java code (Palantir Java Format)
cd frontend && npm test                 # Vitest
cd frontend && npm run lint             # Biome (lint:fix to apply fixes)
cd frontend && npm run typecheck        # TypeScript
```

## CI/CD

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every pull request and push to `main`:

| Job | Checks |
|-----|--------|
| Backend · Lint / Test | Spotless · `./mvnw verify` (all backend tests) |
| Frontend · Lint / Test | Biome + TypeScript · Vitest + production build |
| Security · Trivy | Filesystem: npm dependencies, committed secrets, Dockerfile/Compose misconfigurations · Images: OS packages and application libraries of both Docker images. Fails on fixable HIGH/CRITICAL findings. |

## Configuration

Environment variables for `docker compose` (all optional):

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_PORT` | `3000` | Host port of the application |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | `pokemon` | Database credentials (local defaults only) |
| `POKEAPI_BASE_URL` | `https://pokeapi.co/api/v2` | Source of the catalog sync |
| `SESSION_COOKIE_SECURE` | `false` | Set to `true` when served via HTTPS |

## Time Spent

- **Time spent:** approx. **2 h 45 min** of net working time, spread over one afternoon with breaks in between (the
  commit timestamps therefore span a longer period).

## Project Structure

```
api/openapi.yaml     API contract (specification first)
backend/             Spring Boot: modules identity, catalog (incl. PokéAPI sync), collection
frontend/            React SPA: pages/ compose features/ (auth, layout, pokemon); nginx config for Docker
docs/                Architecture documentation (arc42, ADRs)
docker-compose.yml   postgres + backend + frontend (nginx serves the SPA and proxies /api)
```
