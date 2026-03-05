import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { config } from "../config.js";

import type { DatabaseAdapter } from "./adapter.js";
import type * as schema from "./schema.js";

const dbPath = config.DATABASE_PATH;

const { createSqliteAdapter } = await import("./sqlite/driver.js");
const databaseAdapter: DatabaseAdapter = createSqliteAdapter(dbPath);
const db: BetterSQLite3Database<typeof schema> = databaseAdapter.db;

export { databaseAdapter, db };
