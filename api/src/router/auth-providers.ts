import { getOAuthConfigs } from "../lib/settings.js";
import { publicProcedure, router } from "../trpc.js";

export const authProvidersRouter = router({
  list: publicProcedure.query(async () => {
    const configs = getOAuthConfigs();
    return configs.map((c) => ({
      providerId: c.providerId,
    }));
  }),
});
