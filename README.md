# react-node-trpc-app-template

A full-stack application template with end-to-end type safety, using React + Node + tRPC. Includes Docker and Kubernetes deployment config for self-hosted environments.

## Tech Stack

**API** — Fastify, tRPC v11, Drizzle ORM, SQLite (better-sqlite3)

**UI** — React 19, Vite, TanStack Router, tRPC React Query, shadcn/ui, Tailwind CSS

**Infra** — Docker multi-stage build, Helm chart (nginx ingress, local-path PVC)

## Project Structure

```
├── api/                  # @app/api — Fastify + tRPC backend
│   ├── src/
│   │   ├── index.ts      # Server entrypoint (tRPC, static serving, CORS)
│   │   ├── migrate.ts    # Programmatic Drizzle migration runner
│   │   ├── trpc.ts       # tRPC router/procedure factories
│   │   ├── db/           # Database connection + Drizzle schema
│   │   └── router/       # tRPC routers (notes CRUD)
│   └── drizzle/          # SQL migration files
├── ui/                   # @app/ui — React frontend
│   ├── src/
│   │   ├── routes/       # TanStack Router file-based routes (/, /about, /notes)
│   │   ├── components/   # App components + shadcn/ui primitives
│   │   └── lib/          # tRPC client, utilities
│   └── cypress/          # Component + E2E tests
├── charts/app/           # Helm chart for Kubernetes deployment
├── Dockerfile            # Multi-stage Docker build
└── docker-compose.yml    # Local container testing
```

## Prerequisites

- Node.js 22+
- pnpm 10+

## Getting Started

```bash
pnpm install

# Generate/run database migrations
pnpm db:generate
pnpm db:migrate

# Start dev servers (API on :3000, UI on :5173)
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API and UI dev servers concurrently |
| `pnpm build` | Build both API and UI for production |
| `pnpm lint` | Lint both workspaces |
| `pnpm db:generate` | Generate Drizzle migration files from schema changes |
| `pnpm db:migrate` | Run migrations via drizzle-kit |

## Docker

The Dockerfile uses a multi-stage build: `node:22` (full) for compilation stages, `node:22-slim` for the final production image. The API serves both tRPC endpoints and the built UI static files.

```bash
# Build and run locally
docker compose up --build

# Access at http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `sqlite.db` (dev) / `/data/sqlite.db` (Docker) | SQLite database file path |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin. Set to `false` to disable (same-origin) |
| `UI_DIST_PATH` | `./ui/dist` | Path to built UI static files |
| `MIGRATIONS_PATH` | `./drizzle` | Path to Drizzle migration files |
| `PORT` | `3000` | Server listen port |

## Kubernetes

A Helm chart is included at `charts/app/` targeting self-hosted clusters with nginx ingress and local-path storage.

```bash
# Preview generated manifests
helm template my-app charts/app/ \
  --set image.repository=my-registry/my-app \
  --set image.tag=latest \
  --set ingress.host=app.example.com

# Install
helm install my-app charts/app/ -f my-values.yaml
```

Key design decisions:
- **Recreate strategy** — SQLite doesn't support concurrent writers, so only one pod runs at a time
- **PVC on local-path** — SQLite database persisted at `/data` via a `ReadWriteOnce` volume
- **Health probes** — Liveness and readiness checks on `/health`

### Configurable Values

```yaml
image:
  repository: app
  tag: latest
ingress:
  enabled: true
  className: nginx
  host: app.example.com
  tls:
    enabled: true
    secretName: app-tls
persistence:
  enabled: true
  storageClass: local-path
  size: 1Gi
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
env: {}  # Additional environment variables
```
