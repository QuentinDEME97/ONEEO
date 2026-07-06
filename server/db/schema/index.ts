import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Table de test pour la tâche 0.4 (connexion Drizzle + workflow de migration).
// Sera retirée quand le schéma métier (phase 1) apportera les premières tables réelles.
export const healthCheck = sqliteTable("health_check", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});
