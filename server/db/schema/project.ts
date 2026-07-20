import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";
import { space } from "./identity";

export const project = sqliteTable("project", {
  id: id(),
  spaceId: text("space_id")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // null = hérite du thème de l'espace (surcharge appliquée en tâche 1.9)
  theme: text("theme"),
  deliverableLabel: text("deliverable_label").notNull().default("Livrable"),
  ...timestamps,
});
