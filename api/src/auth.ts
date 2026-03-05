import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import { config } from "./config.js";
import { db, databaseAdapter } from "./db/index.js";
import * as schema from "./db/schema.js";
import { getOAuthConfigs } from "./lib/settings.js";

if (!config.BETTER_AUTH_BASE_URL && config.NODE_ENV === "production") {
  console.warn(
    "Warning: BETTER_AUTH_BASE_URL is not set in production. Auth callbacks may not work correctly.",
  );
}

// Trusted providers for account linking — comma-separated list via env var
const trustedProviders = config.TRUSTED_PROVIDERS
  ? config.TRUSTED_PROVIDERS.split(",").map((p) => p.trim()).filter(Boolean)
  : [];

const oauthConfigs = getOAuthConfigs();

export const auth = betterAuth({
  baseURL: config.BETTER_AUTH_BASE_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: databaseAdapter.authProvider,
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders,
    },
  },
  trustedOrigins: config.CORS_ORIGIN === "false" ? [] : [config.CORS_ORIGIN],
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
