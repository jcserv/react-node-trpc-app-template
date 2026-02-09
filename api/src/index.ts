import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import fastify, { type FastifyError } from "fastify";

import { auth } from "./auth.js";
import { logAudit } from "./lib/audit.js";
import { seedAdmin } from "./lib/seed-admin.js";
import { type AppRouter, appRouter } from "./router/index.js";
import { createContext } from "./trpc.js";

const server = fastify({ logger: true });

const isDev = process.env.NODE_ENV !== "production";

// Sanitize error responses — never leak stack traces in production
server.setErrorHandler((error: FastifyError, _req, reply) => {
  server.log.error(error);
  const statusCode = error.statusCode ?? 500;
  reply.status(statusCode).send({
    statusCode,
    error: error.name,
    message: isDev ? error.message : statusCode >= 500 ? "Internal Server Error" : error.message,
  });
});

// 1. Helmet — security headers
await server.register(helmet, {
  contentSecurityPolicy: isDev
    ? false
    : {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
        },
      },
});

// 2. CORS — set CORS_ORIGIN=false in production (same-origin, no CORS needed)
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
if (corsOrigin !== "false") {
  await server.register(cors, {
    origin: corsOrigin,
    credentials: true,
  });
}

// 3. Rate limiting — global: 100 req/min
await server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// 4. Better Auth routes at /api/auth/*
//    Scoped plugin so we can override the content-type parser — Fastify's default
//    JSON parser consumes req.raw before toNodeHandler can read it, causing hangs.
await server.register(async (instance) => {
  instance.addContentTypeParser("application/json", (_req, _payload, done) => {
    done(null);
  });

  const authHandler = toNodeHandler(auth);

  instance.all(
    "/api/auth/*",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      // reply.hijack() bypasses Fastify's response pipeline, so @fastify/cors
      // headers never get written. Set them on the raw response manually.
      if (corsOrigin !== "false") {
        reply.raw.setHeader("Access-Control-Allow-Origin", corsOrigin);
        reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
        reply.raw.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        reply.raw.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );

        if (req.method === "OPTIONS") {
          reply.raw.statusCode = 204;
          reply.raw.end();
          return reply.hijack();
        }
      }

      // Audit log auth events
      const url = req.url;
      const isAuthAction = [
        "/sign-in/email",
        "/sign-up/email",
        "/sign-out",
        "/sign-in/oauth2",
        "/callback/oauth2",
      ].some((p) => url.includes(p));

      await authHandler(req.raw, reply.raw);

      // Log after handler has written the response
      if (
        isAuthAction &&
        reply.raw.statusCode >= 200 &&
        reply.raw.statusCode < 300
      ) {
        try {
          const authPath = url.replace(/^\/api\/auth\//, "");
          logAudit({
            action: `auth:${authPath}`,
            ipAddress: req.ip,
          });
        } catch {
          // Don't let audit logging errors affect the response
        }
      }

      reply.hijack();
    },
  );
});

// 5. tRPC plugin
await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

// 6. Health check
server.get("/health", async () => {
  return { status: "ok" };
});

// 7. Admin backup endpoint — streams SQLite DB file
server.get("/api/admin/backup", async (req, reply) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.raw.headers),
  });

  if (!session?.user) {
    return reply.status(401).send({ error: "Not authenticated" });
  }

  const role = (session.user as Record<string, unknown>).role as
    | string
    | undefined;
  if (role !== "admin") {
    return reply.status(403).send({ error: "Admin access required" });
  }

  const dbPath = path.resolve(process.env.DATABASE_PATH || "sqlite.db");
  if (!existsSync(dbPath)) {
    return reply.status(404).send({ error: "Database file not found" });
  }

  const stat = statSync(dbPath);
  const filename = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`;

  reply.header("Content-Type", "application/octet-stream");
  reply.header("Content-Disposition", `attachment; filename="${filename}"`);
  reply.header("Content-Length", stat.size);

  return reply.send(createReadStream(dbPath));
});

// 8. Static file serving — serve built UI assets in production
const uiDistPath = path.resolve(process.env.UI_DIST_PATH || "./ui/dist");
if (existsSync(uiDistPath)) {
  await server.register(fastifyStatic, {
    root: uiDistPath,
    wildcard: false,
  });

  // SPA fallback — serve index.html for client-side routes
  server.setNotFoundHandler((_req, reply) => {
    return reply.sendFile("index.html");
  });
}

// Seed admin user on first startup
await seedAdmin();

const port = Number(process.env.PORT) || 3000;

try {
  await server.listen({ port, host: "0.0.0.0" });
  console.log(`Server listening on port ${port}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
