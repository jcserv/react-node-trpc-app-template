import { router } from "../trpc.js";
import { adminAuditRouter } from "./admin-audit.js";
import { adminSettingsRouter } from "./admin-settings.js";
import { adminUsersRouter } from "./admin-users.js";
import { authProvidersRouter } from "./auth-providers.js";
import { notesRouter } from "./notes.js";

const adminRouter = router({
  users: adminUsersRouter,
  audit: adminAuditRouter,
  settings: adminSettingsRouter,
});

export const appRouter = router({
  notes: notesRouter,
  authProviders: authProvidersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
