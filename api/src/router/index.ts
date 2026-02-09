import { router } from "../trpc.js";
import { notesRouter } from "./notes.js";

export const appRouter = router({
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
