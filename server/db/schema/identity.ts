import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
};

export const user = sqliteTable("user", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatarPath: text("avatar_path"),
  mustChangePassword: integer("must_change_password", { mode: "boolean" })
    .notNull()
    .default(false),
  ...timestamps,
});

export const space = sqliteTable("space", {
  id: id(),
  name: text("name").notNull(),
  theme: text("theme").notNull().default("light"),
  ...timestamps,
});

export const role = sqliteTable(
  "role",
  {
    id: id(),
    spaceId: text("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isSystem: integer("is_system", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (table) => [unique("role_space_name_unique").on(table.spaceId, table.name)]
);

export const spaceMembership = sqliteTable(
  "space_membership",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    spaceId: text("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    unique("space_membership_user_space_unique").on(
      table.userId,
      table.spaceId
    ),
  ]
);

export const permission = sqliteTable("permission", {
  id: id(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  ...timestamps,
});

export const rolePermission = sqliteTable(
  "role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);
