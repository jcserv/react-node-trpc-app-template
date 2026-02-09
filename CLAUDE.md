# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (API on :3000, UI on :5173)
pnpm dev            # both concurrently
pnpm dev:api        # API only
pnpm dev:ui         # UI only

# Build
pnpm build          # build both (API via tsc, UI via vite)

# Lint
pnpm lint           # lint both (API: eslint --fix, UI: prettier --write + eslint --fix)

# Database
pnpm db:generate    # generate Drizzle migration SQL from schema changes
pnpm db:migrate     # run migrations via drizzle-kit

# Tests (UI only)
pnpm --filter @app/ui test              # all tests (types + unit + cypress)
pnpm --filter @app/ui test:unit         # vitest unit tests
pnpm --filter @app/ui test:types        # tsc --noEmit type check
pnpm --filter @app/ui test:cypress:dev  # cypress component tests (interactive)

# Docker
docker compose up --build               # build and run at http://localhost:3000
```

**Pre-commit hook** runs: UI type check, unit tests, and lint.

## Architecture

pnpm monorepo with two workspaces: `api/` (@app/api) and `ui/` (@app/ui).

### Type Flow (API → UI)

The UI depends on `@app/api: workspace:*` as a **devDependency** to import the `AppRouter` type. This is the critical type-safety bridge:

- **API exports**: `api/src/router/index.ts` exports `AppRouter` type
- **UI imports**: `ui/src/lib/trpc.ts` does `import type { AppRouter } from "@app/api/router/index.js"` and creates the typed tRPC client
- Both tsconfigs use `moduleResolution: "Bundler"` — this is required for the workspace type import to resolve

### API (`api/`)

Fastify server with tRPC v11 and Drizzle ORM on SQLite.

- **Entrypoint**: `src/index.ts` — registers Helmet, CORS, rate limiting, Better Auth routes at `/api/auth/*`, tRPC plugin at `/trpc`, `/health` endpoint, and `@fastify/static` for serving UI in production (with SPA fallback)
- **Auth**: `src/auth.ts` — Better Auth instance with Drizzle adapter and email/password enabled. `BETTER_AUTH_SECRET` env var required (32+ chars)
- **tRPC setup**: `src/trpc.ts` exports `router`, `publicProcedure`, and `protectedProcedure`. Uses `superjson` transformer. Context includes session/user from Better Auth
- **Routers**: `src/router/index.ts` merges sub-routers into `appRouter`. Add new routers here
- **Database**: `src/db/index.ts` creates the Drizzle client; `src/db/schema.ts` defines tables. Path configurable via `DATABASE_PATH` env var
- **Migrations**: `src/migrate.ts` is a standalone runner using `drizzle-orm/better-sqlite3/migrator` (not drizzle-kit) for production use. Migration SQL files live in `api/drizzle/`

### UI (`ui/`)

React 19 + Vite + TanStack Router (file-based routing) + shadcn/ui.

- **Routes**: `src/routes/` — file-based with TanStack Router. `__root.tsx` is the layout. Pages use `.lazy.tsx` suffix for code-splitting. Route tree is auto-generated (`routeTree.gen.ts`) by the Vite plugin on dev start
- **tRPC provider**: `src/components/trpc-provider.tsx` — wraps app with tRPC + React Query. API URL defaults to `http://localhost:3000/trpc`, overridden by `VITE_API_URL`
- **shadcn/ui**: Components in `src/components/ui/`, barrel exported from `ui/index.ts`. Config: zinc theme, `cssVariables: false`. Add new components via `npx shadcn@latest add <component>` from the `ui/` directory
- **Path alias**: `@/` maps to `ui/src/`

### Production / Docker

Single container — Fastify serves both tRPC API and static UI files. Multi-stage Dockerfile:
- `node:22` (full) for build stages (native module compilation for better-sqlite3)
- `node:22-slim` for final production image
- Separate `prod-deps` stage does a fresh `pnpm install --prod` to preserve pnpm symlinks and native binaries
- `CMD` runs migrations then starts the server

Key env vars: `DATABASE_PATH`, `CORS_ORIGIN` (set `"false"` to disable), `UI_DIST_PATH`, `MIGRATIONS_PATH`, `BETTER_AUTH_SECRET`.

Container runs as non-root `node` user. Docker Compose adds `read_only`, `no-new-privileges`, and `tmpfs` for `/tmp`.

### Helm Chart (`charts/app/`)

Targets self-hosted K8s with nginx ingress and local-path storage. Uses `Recreate` deployment strategy (SQLite single-writer constraint). PVC mounted at `/data` for database persistence. Includes pod/container security contexts (non-root, read-only root filesystem, drop all capabilities). `BETTER_AUTH_SECRET` sourced from K8s Secret.

## Patterns to Follow

- **New tRPC router**: Define in `api/src/router/<name>.ts` using `router` and `protectedProcedure` (or `publicProcedure` for unauthenticated access) from `../trpc.js`, add to `appRouter` in `api/src/router/index.ts`. Validate inputs with Zod
- **New DB table**: Add to `api/src/db/schema.ts`, run `pnpm db:generate` then `pnpm db:migrate`
- **New UI route**: Create `ui/src/routes/<path>.lazy.tsx`. The route tree auto-regenerates on dev server restart
- **New shadcn component**: Run from `ui/` directory, then add to `ui/src/components/ui/index.ts` barrel export
- **Drizzle queries**: Always `await` `.returning()` before indexing (e.g., `const result = await db.insert(...).returning(); return result[0]`)

## Security

### Authentication (Better Auth)

- **Server**: `api/src/auth.ts` configures Better Auth with Drizzle adapter and email/password auth
- **Client**: `ui/src/lib/auth-client.ts` exports `useSession`, `signIn`, `signUp`, `signOut`
- **Auth routes**: Better Auth handles `/api/auth/*` endpoints (sign-in, sign-up, sign-out, session)
- **tRPC integration**: `protectedProcedure` checks session and injects `ctx.user`; all notes are scoped by `userId`
- **Cookies**: `credentials: "include"` set on tRPC httpBatchLink for cross-origin cookie support

### Procedures

- `publicProcedure` — no auth required (use sparingly)
- `protectedProcedure` — requires valid session, auto-logs mutations to audit log

### Security Headers & Rate Limiting

- `@fastify/helmet` adds CSP, HSTS, X-Frame-Options, X-Content-Type-Options (CSP disabled in dev)
- `@fastify/rate-limit` — global: 100 req/min, auth routes: 10 req/min

### Audit Logging

- `api/src/lib/audit.ts` — `logAudit()` writes to `audit_log` table (fire-and-forget)
- Auth events (sign-in/sign-up/sign-out) logged in Fastify auth handler
- tRPC mutations auto-logged via `protectedProcedure` middleware

### Docker / K8s Hardening

- Dockerfile runs as non-root `node` user
- Docker Compose: `read_only`, `no-new-privileges`, `tmpfs` for `/tmp`
- K8s: `runAsNonRoot`, `readOnlyRootFilesystem`, `drop: [ALL]` capabilities, `BETTER_AUTH_SECRET` from Secret

### Environment Variables

- `BETTER_AUTH_SECRET` — required, 32+ character secret for session signing
- See `.env.example` for full list
