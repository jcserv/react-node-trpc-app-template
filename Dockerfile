# ---- Build base (full image with build tools for native modules) ----
FROM node:22-bookworm AS build-base
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate
WORKDIR /app

# ---- Dependencies ----
FROM build-base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/
COPY ui/package.json ui/
RUN HUSKY=0 pnpm install --frozen-lockfile

# ---- Build UI ----
FROM deps AS build-ui
ARG BUILD_VERSION=dev
ARG BUILD_SHA=local
ENV BUILD_VERSION=$BUILD_VERSION
ENV BUILD_SHA=$BUILD_SHA
# API source needed for workspace type resolution (@app/api devDep)
COPY api/src/ api/src/
COPY api/tsconfig.json api/
COPY ui/ ui/
RUN pnpm --filter @app/ui build

# ---- Build API ----
FROM deps AS build-api
COPY api/ api/
RUN pnpm --filter @app/api build

# ---- Production deps ----
FROM build-base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/
COPY ui/package.json ui/
# Strip husky prepare script, then install prod-only deps
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));delete p.scripts.prepare;require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" && \
    pnpm install --frozen-lockfile --prod

# ---- Production (slim image) ----
FROM node:22-bookworm-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init=1.2.5-2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

# Copy prod node_modules (fresh install with working native binaries and symlinks)
COPY --from=prod-deps /app/ ./

# API dist
COPY --from=build-api /app/api/dist api/dist/
# Drizzle migration files
COPY api/drizzle api/drizzle/
# UI dist
COPY --from=build-ui /app/ui/dist ui/dist/

# Run as non-root user
RUN mkdir -p /data && chown -R node:node /data /app
USER node

ENV DATABASE_PATH=/data/sqlite.db
ENV CORS_ORIGIN=false
ENV UI_DIST_PATH=/app/ui/dist
ENV MIGRATIONS_PATH=/app/api/drizzle
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Run migrations then start server
CMD ["dumb-init", "sh", "-c", "node api/dist/migrate.js && node api/dist/index.js"]
