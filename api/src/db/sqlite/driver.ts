import Database, { type Database as DatabaseType } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import type { DatabaseAdapter } from "../adapter.js";
import * as schema from "../schema.js";

export function createSqliteAdapter(dbPath: string): DatabaseAdapter {
  const sqlite: DatabaseType = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  return {
    db,
    rawDb: sqlite,
    authProvider: "sqlite",
    checkpoint() {
      sqlite.pragma("wal_checkpoint(TRUNCATE)");
    },
    close() {
      sqlite.close();
    },
  };
}
