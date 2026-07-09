import { fileURLToPath } from "node:url";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { space, spaceMembership, user } from "../../db/schema/identity";
import { useDb } from "../db";
import { ensureSystemRoles } from "../roles";

// Hash PHC pour le mot de passe "Test1234!" — précalculé (format auto-porteur,
// vérifiable indépendamment de la config runtime) car `hashPassword()` dépend
// de `useRuntimeConfig()` et n'est pas utilisable hors du process Nitro.
const TEST_PASSWORD_HASH =
  "$scrypt$n=16384,r=8,p=1$d3lPuIVrTghwGJcoy5TufQ$/a1u7fLdCnHuJmM26+jDKHxqDQF4LIdw/kiXxF4cdRnPF2PWjt9ADOtuknFOxywVH0qj3F2HR6I3Y0gBLCcl+w";
const TEST_PASSWORD = "Test1234!";
const TEST_EMAIL = `context-e2e-${Date.now()}@example.com`;

describe("e2e — contexte espace (server/utils/context.ts)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  const db = useDb();
  let memberSpaceId: string;
  let foreignSpaceId: string;
  let cookie: string;

  beforeAll(async () => {
    const created = db.transaction((tx) => {
      const memberSpace = tx
        .insert(space)
        .values({ name: "Espace test 1.5" })
        .returning()
        .get();
      const { memberRoleId } = ensureSystemRoles(tx, memberSpace.id);
      const newUser = tx
        .insert(user)
        .values({
          email: TEST_EMAIL,
          passwordHash: TEST_PASSWORD_HASH,
          firstName: "Test",
          lastName: "Contexte",
        })
        .returning()
        .get();
      tx.insert(spaceMembership)
        .values({
          userId: newUser.id,
          spaceId: memberSpace.id,
          roleId: memberRoleId,
        })
        .run();

      const foreignSpace = tx
        .insert(space)
        .values({ name: "Espace étranger 1.5" })
        .returning()
        .get();
      ensureSystemRoles(tx, foreignSpace.id);

      return { memberSpace, foreignSpace };
    });

    memberSpaceId = created.memberSpace.id;
    foreignSpaceId = created.foreignSpace.id;

    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    cookie =
      (loginResponse.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
  });

  afterAll(() => {
    db.delete(space).where(eq(space.id, memberSpaceId)).run();
    db.delete(space).where(eq(space.id, foreignSpaceId)).run();
    db.delete(user).where(eq(user.email, TEST_EMAIL)).run();
  });

  it("GET /api/auth/me sans session renvoie 401", async () => {
    await expect($fetch("/api/auth/me")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("GET /api/auth/me avec session renvoie le spaceId de l'espace dont l'utilisateur est membre", async () => {
    const me = await $fetch("/api/auth/me", { headers: { cookie } });
    expect(me).toMatchObject({ spaceId: memberSpaceId, projectId: null });
  });

  it("GET /api/auth/me?spaceId=<espace étranger> renvoie 403", async () => {
    await expect(
      $fetch("/api/auth/me", {
        headers: { cookie },
        query: { spaceId: foreignSpaceId },
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
