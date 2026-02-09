import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: corsOrigin === "false" ? [] : [corsOrigin],
});
