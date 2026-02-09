import { z } from "zod";

import {
  getOAuthConfigs,
  getSetting,
  setOAuthConfigs,
  setSetting,
} from "../lib/settings.js";
import { adminProcedure, router } from "../trpc.js";

const oauthProviderSchema = z.object({
  providerId: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Must be lowercase alphanumeric with dashes"),
  discoveryUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  scopes: z.array(z.string()).optional().default(["openid", "profile", "email"]),
  pkce: z.boolean().optional().default(true),
});

export const adminSettingsRouter = router({
  getOidc: adminProcedure.query(async () => {
    const configs = getOAuthConfigs();
    return configs.map((c) => ({
      ...c,
      clientSecret: c.clientSecret ? "••••••••" : "",
    }));
  }),

  setOidc: adminProcedure
    .input(z.object({ providers: z.array(oauthProviderSchema) }))
    .mutation(async ({ input }) => {
      setOAuthConfigs(input.providers);
      return { success: true, restartRequired: true };
    }),

  get: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return { value: getSetting(input.key) };
    }),

  set: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      setSetting(input.key, input.value);
      return { success: true };
    }),
});
