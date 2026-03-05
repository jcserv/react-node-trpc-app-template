import { z } from "zod";

import * as notesService from "../services/notes.js";
import { protectedProcedure, router } from "../trpc.js";

export const notesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return notesService.listNotes(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return notesService.getNoteById(input.id, ctx.user.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return notesService.createNote(ctx.user.id, input);
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
      return notesService.updateNote(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return notesService.deleteNote(input.id, ctx.user.id);
    }),
});
