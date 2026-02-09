import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = process.env.DATABASE_PATH || "sqlite.db";
const migrationsFolder = process.env.MIGRATIONS_PATH || "./drizzle";

console.log(`Running migrations on ${dbPath} from ${migrationsFolder}`);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder });

sqlite.close();
console.log("Migrations complete");
