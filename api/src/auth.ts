import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import { db } from "./db/index.js";
import * as schema from "./db/schema.js";
import { getOAuthConfigs } from "./lib/settings.js";

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const oauthConfigs = getOAuthConfigs();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: corsOrigin === "false" ? [] : [corsOrigin],
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    ...(oauthConfigs.length > 0
      ? [
          genericOAuth({
            config: oauthConfigs.map((c) => ({
              providerId: c.providerId,
              discoveryUrl: c.discoveryUrl,
              clientId: c.clientId,
              clientSecret: c.clientSecret,
              scopes: c.scopes,
              pkce: c.pkce ?? true,
            })),
          }),
        ]
      : []),
  ],
});
