import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

export const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
};
