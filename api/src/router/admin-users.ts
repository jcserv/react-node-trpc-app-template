import { eq } from "drizzle-orm";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";

import { auth } from "../auth.js";
import { db } from "../db/index.js";
import { notes } from "../db/schema.js";
import { adminProcedure, router } from "../trpc.js";

export const adminUsersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        searchField: z
          .enum(["email", "name"])
          .optional()
          .default("email"),
        searchValue: z.string().optional(),
        sortBy: z.string().optional().default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await auth.api.listUsers({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        query: {
          limit: input.limit,
          offset: input.offset,
          ...(input.searchValue
            ? {
                searchField: input.searchField,
                searchValue: input.searchValue,
              }
            : {}),
          sortBy: input.sortBy,
          sortDirection: input.sortDirection,
        },
      });
      return result;
    }),

  ban: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banReason: z.string().optional(),
        banExpiresIn: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await auth.api.banUser({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn: input.banExpiresIn,
        },
      });
      return { success: true };
    }),

  unban: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await auth.api.unbanUser({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId },
      });
      return { success: true };
    }),

  setRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await auth.api.setRole({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId, role: input.role },
      });
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, ...fields } = input;
      await auth.api.adminUpdateUser({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId, data: fields },
      });
      return { success: true };
    }),

  setPassword: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await auth.api.setUserPassword({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId, newPassword: input.newPassword },
      });
      return { success: true };
    }),

  remove: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Delete app-specific data that Better Auth doesn't know about
      db.delete(notes).where(eq(notes.userId, input.userId)).run();

      await auth.api.removeUser({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId },
      });
      return { success: true };
    }),

  listSessions: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await auth.api.listUserSessions({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId },
      });
      return result;
    }),

  revokeSession: adminProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await auth.api.revokeUserSession({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { sessionToken: input.sessionToken },
      });
      return { success: true };
    }),

  revokeSessions: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await auth.api.revokeUserSessions({
        headers: fromNodeHeaders(ctx.req.raw.headers),
        body: { userId: input.userId },
      });
      return { success: true };
    }),
});
