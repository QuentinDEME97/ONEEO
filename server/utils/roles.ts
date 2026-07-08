import { inArray } from "drizzle-orm";
import { permission, role, rolePermission, user } from "../db/schema/identity";
import type { useDb } from "./db";

export const SYSTEM_PERMISSIONS = [
  { key: "dashboard.view", label: "Voir le dashboard" },
  { key: "sprints.manage", label: "Gérer les sprints" },
  { key: "livrables.manage", label: "Gérer les livrables" },
  { key: "equipes.manage", label: "Gérer les équipes" },
  { key: "temps_conges.manage", label: "Gérer temps & congés" },
  { key: "anomalies_sla.manage", label: "Gérer anomalies & SLA" },
  { key: "rapports_ia.manage", label: "Gérer rapports & IA" },
  { key: "parametres.manage", label: "Gérer les paramètres" },
] as const;

type Database = ReturnType<typeof useDb>;
type Transaction = Parameters<Database["transaction"]>[0] extends (
  tx: infer T
) => unknown
  ? T
  : never;
type Db = Database | Transaction;

function ensurePermissions(db: Db) {
  for (const { key, label } of SYSTEM_PERMISSIONS) {
    db.insert(permission)
      .values({ key, label })
      .onConflictDoNothing({ target: permission.key })
      .run();
  }

  return db
    .select({ id: permission.id })
    .from(permission)
    .where(
      inArray(
        permission.key,
        SYSTEM_PERMISSIONS.map((p) => p.key)
      )
    )
    .all();
}

/**
 * Crée les rôles système Owner/Member pour un espace et leur attribue
 * toutes les permissions (pas de granularité en MVP, cf. phase 5).
 * Doit être appelée depuis une transaction Drizzle synchrone.
 */
export function ensureSystemRoles(db: Db, spaceId: string) {
  const permissions = ensurePermissions(db);

  const ownerRole = db
    .insert(role)
    .values({ spaceId, name: "Owner", isSystem: true })
    .returning()
    .get();
  const memberRole = db
    .insert(role)
    .values({ spaceId, name: "Member", isSystem: true })
    .returning()
    .get();

  db.insert(rolePermission)
    .values(
      [ownerRole, memberRole].flatMap((r) =>
        permissions.map((p) => ({ roleId: r.id, permissionId: p.id }))
      )
    )
    .run();

  return { ownerRoleId: ownerRole.id, memberRoleId: memberRole.id };
}

export function hasAnyUser(db: Db) {
  return Boolean(db.select({ id: user.id }).from(user).limit(1).get());
}
