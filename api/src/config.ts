import { z } from "zod";

const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  BETTER_AUTH_SECRET: isTest
    ? z.string().default("test-secret-that-is-at-least-32-characters-long")
    : z
        .string()
        .min(
          32,
          "BETTER_AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32",
        ),
  BETTER_AUTH_BASE_URL: z.string().url().optional(),
  DATABASE_PATH: z.string().default("sqlite.db"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  UI_DIST_PATH: z.string().default("./ui/dist"),
  MIGRATIONS_PATH: z.string().default("./drizzle"),
  TRUSTED_PROVIDERS: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
});

function parseConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  return result.data;
}

export const config = parseConfig();
