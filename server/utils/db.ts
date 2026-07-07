import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function useDb() {
  if (!db) {
    const sqlite = new Database("data/oneeo.sqlite");
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
  }
  return db;
}
