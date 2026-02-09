import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { appSettings } from "../db/schema.js";

export function getSetting(key: string): string | null {
  const row = db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .get();
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.insert(appSettings)
    .values({ key, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date().toISOString() },
    })
    .run();
}

export interface OAuthProviderConfig {
  providerId: string;
  discoveryUrl: string;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  pkce?: boolean;
}

export function getOAuthConfigs(): OAuthProviderConfig[] {
  const raw = getSetting("oidc_providers");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OAuthProviderConfig[];
  } catch {
    return [];
  }
}

export function setOAuthConfigs(configs: OAuthProviderConfig[]): void {
  setSetting("oidc_providers", JSON.stringify(configs));
}
