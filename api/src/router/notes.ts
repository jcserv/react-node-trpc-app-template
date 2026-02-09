import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { notes } from "../db/schema.js";
import { protectedProcedure, router } from "../trpc.js";

export const notesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, ctx.user.id))
      .orderBy(notes.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const result = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id)));
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .insert(notes)
        .values({ ...input, userId: ctx.user.id })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await db
        .update(notes)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(and(eq(notes.id, id), eq(notes.userId, ctx.user.id)))
        .returning();
      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      }
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .delete(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id)))
        .returning();
      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      }
      return { success: true };
    }),
});
