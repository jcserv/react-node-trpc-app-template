import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { fromNodeHeaders } from "better-auth/node";
import superjson from "superjson";

import { auth } from "./auth.js";
import { logAudit } from "./lib/audit.js";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.raw.headers),
  });
  return {
    req,
    res,
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  async ({ ctx, next, path, type }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const result = await next({
      ctx: {
        ...ctx,
        user: ctx.user,
        session: ctx.session!,
      },
    });

    // Audit log mutations
    if (type === "mutation") {
      logAudit({
        userId: ctx.user.id,
        action: `trpc:${path}`,
        resource: path,
        ipAddress: ctx.req.ip,
      });
    }

    return result;
  },
);
