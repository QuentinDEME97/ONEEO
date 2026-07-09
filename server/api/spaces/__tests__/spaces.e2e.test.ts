import { fileURLToPath } from "node:url";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { space, spaceMembership, user } from "../../../db/schema/identity";
import { useDb } from "../../../utils/db";
import { ensureSystemRoles } from "../../../utils/roles";

// Hash PHC pour le mot de passe "Test1234!" — précalculé (format auto-porteur,
// vérifiable indépendamment de la config runtime) car `hashPassword()` dépend
// de `useRuntimeConfig()` et n'est pas utilisable hors du process Nitro.
const TEST_PASSWORD_HASH =
  "$scrypt$n=16384,r=8,p=1$d3lPuIVrTghwGJcoy5TufQ$/a1u7fLdCnHuJmM26+jDKHxqDQF4LIdw/kiXxF4cdRnPF2PWjt9ADOtuknFOxywVH0qj3F2HR6I3Y0gBLCcl+w";
const TEST_PASSWORD = "Test1234!";
const TEST_EMAIL = `spaces-e2e-${Date.now()}@example.com`;

describe("e2e — espaces (server/api/spaces)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  const db = useDb();
  let memberSpaceId: string;
  let foreignSpaceId: string;
  let createdSpaceId: string;
  let cookie: string;

  beforeAll(async () => {
    const created = db.transaction((tx) => {
      const memberSpace = tx
        .insert(space)
        .values({ name: "Espace test 1.6" })
        .returning()
        .get();
      const { ownerRoleId } = ensureSystemRoles(tx, memberSpace.id);
      const newUser = tx
        .insert(user)
        .values({
          email: TEST_EMAIL,
          passwordHash: TEST_PASSWORD_HASH,
          firstName: "Test",
          lastName: "Espaces",
        })
        .returning()
        .get();
      tx.insert(spaceMembership)
        .values({
          userId: newUser.id,
          spaceId: memberSpace.id,
          roleId: ownerRoleId,
        })
        .run();

      const foreignSpace = tx
        .insert(space)
        .values({ name: "Espace étranger 1.6" })
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
    if (createdSpaceId) {
      db.delete(space).where(eq(space.id, createdSpaceId)).run();
    }
    db.delete(user).where(eq(user.email, TEST_EMAIL)).run();
  });

  it("GET /api/spaces sans session renvoie 401", async () => {
    await expect($fetch("/api/spaces")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("GET /api/spaces liste l'espace initial de l'utilisateur", async () => {
    const result = await $fetch<{
      spaces: { id: string }[];
      currentSpaceId: string;
    }>("/api/spaces", { headers: { cookie } });
    expect(result.currentSpaceId).toBe(memberSpaceId);
    expect(result.spaces.map((s) => s.id)).toEqual([memberSpaceId]);
  });

  it("POST /api/spaces crée un espace, l'utilisateur en devient Owner et bascule dessus", async () => {
    // POST /api/spaces pose un nouveau `currentSpaceId` en session : `setUserSession` renvoie
    // un cookie re-signé qu'il faut recapturer (comme après le login), sinon les appels suivants
    // retomberaient sur l'ancienne session (`$fetch` ne persiste pas les cookies entre appels).
    const createResponse = await fetch("/api/spaces", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ name: "Nouvel espace" }),
    });
    const created = (await createResponse.json()) as {
      id: string;
      name: string;
    };
    cookie =
      (createResponse.headers.get("set-cookie") ?? "").split(";")[0] ?? cookie;
    createdSpaceId = created.id;
    expect(created.name).toBe("Nouvel espace");

    const result = await $fetch<{
      spaces: { id: string }[];
      currentSpaceId: string;
    }>("/api/spaces", { headers: { cookie } });
    expect(result.currentSpaceId).toBe(createdSpaceId);
    expect(result.spaces.map((s) => s.id).sort()).toEqual(
      [memberSpaceId, createdSpaceId].sort()
    );
  });

  it("POST /api/spaces/:id/select rebascule sur l'espace initial", async () => {
    const selectResponse = await fetch(`/api/spaces/${memberSpaceId}/select`, {
      method: "POST",
      headers: { cookie },
    });
    const selected = (await selectResponse.json()) as { id: string };
    cookie =
      (selectResponse.headers.get("set-cookie") ?? "").split(";")[0] ?? cookie;
    expect(selected.id).toBe(memberSpaceId);

    const result = await $fetch<{ currentSpaceId: string }>("/api/spaces", {
      headers: { cookie },
    });
    expect(result.currentSpaceId).toBe(memberSpaceId);
  });

  it("POST /api/spaces/:id/select vers un espace étranger renvoie 403", async () => {
    await expect(
      $fetch(`/api/spaces/${foreignSpaceId}/select`, {
        method: "POST",
        headers: { cookie },
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
