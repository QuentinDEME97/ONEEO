import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { useDb } from "../utils/db";

migrate(useDb(), { migrationsFolder: "./server/db/migrations" });

console.log("Migrations appliquées.");
