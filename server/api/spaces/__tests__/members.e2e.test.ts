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
const OWNER_EMAIL = `members-owner-e2e-${Date.now()}@example.com`;
const MEMBER_EMAIL = `members-member-e2e-${Date.now()}@example.com`;
const NEW_MEMBER_EMAIL = `members-new-e2e-${Date.now()}@example.com`;

describe("e2e — membres d'espace (server/api/spaces/[id]/members)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  const db = useDb();
  let spaceId: string;
  let foreignSpaceId: string;
  let ownerCookie: string;
  let memberCookie: string;
  let createdMemberId: string;
  let temporaryPassword: string;

  beforeAll(async () => {
    const created = db.transaction((tx) => {
      const mySpace = tx.insert(space).values({ name: "Espace membres 1.7" }).returning().get();
      const { ownerRoleId, memberRoleId } = ensureSystemRoles(tx, mySpace.id);

      const ownerUser = tx
        .insert(user)
        .values({
          email: OWNER_EMAIL,
          passwordHash: TEST_PASSWORD_HASH,
          firstName: "Owner",
          lastName: "Test",
        })
        .returning()
        .get();
      tx.insert(spaceMembership)
        .values({ userId: ownerUser.id, spaceId: mySpace.id, roleId: ownerRoleId })
        .run();

      const memberUser = tx
        .insert(user)
        .values({
          email: MEMBER_EMAIL,
          passwordHash: TEST_PASSWORD_HASH,
          firstName: "Member",
          lastName: "Test",
        })
        .returning()
        .get();
      tx.insert(spaceMembership)
        .values({ userId: memberUser.id, spaceId: mySpace.id, roleId: memberRoleId })
        .run();

      const foreignSpace = tx
        .insert(space)
        .values({ name: "Espace étranger membres 1.7" })
        .returning()
        .get();
      ensureSystemRoles(tx, foreignSpace.id);

      return { mySpace, foreignSpace };
    });

    spaceId = created.mySpace.id;
    foreignSpaceId = created.foreignSpace.id;

    const ownerLogin = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: OWNER_EMAIL, password: TEST_PASSWORD }),
    });
    ownerCookie = (ownerLogin.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

    const memberLogin = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: MEMBER_EMAIL, password: TEST_PASSWORD }),
    });
    memberCookie = (memberLogin.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
  });

  afterAll(() => {
    db.delete(space).where(eq(space.id, spaceId)).run();
    db.delete(space).where(eq(space.id, foreignSpaceId)).run();
    db.delete(user).where(eq(user.email, OWNER_EMAIL)).run();
    db.delete(user).where(eq(user.email, MEMBER_EMAIL)).run();
    if (createdMemberId) {
      db.delete(user).where(eq(user.id, createdMemberId)).run();
    }
  });

  it("GET /api/spaces/:id/members sans session renvoie 401", async () => {
    await expect($fetch(`/api/spaces/${spaceId}/members`)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("un Member (non-Owner) ne peut pas créer de membre", async () => {
    await expect(
      $fetch(`/api/spaces/${spaceId}/members`, {
        method: "POST",
        headers: { cookie: memberCookie },
        body: { email: NEW_MEMBER_EMAIL, firstName: "Nouveau", lastName: "Membre" },
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("l'Owner crée un membre avec un mot de passe temporaire", async () => {
    const result = await $fetch<{
      user: { id: string; email: string };
      temporaryPassword: string;
    }>(`/api/spaces/${spaceId}/members`, {
      method: "POST",
      headers: { cookie: ownerCookie },
      body: { email: NEW_MEMBER_EMAIL, firstName: "Nouveau", lastName: "Membre" },
    });
    createdMemberId = result.user.id;
    temporaryPassword = result.temporaryPassword;
    expect(temporaryPassword).toHaveLength(12);

    const row = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, createdMemberId),
    });
    expect(row?.mustChangePassword).toBe(true);
  });

  it("un email déjà utilisé renvoie 409", async () => {
    await expect(
      $fetch(`/api/spaces/${spaceId}/members`, {
        method: "POST",
        headers: { cookie: ownerCookie },
        body: { email: NEW_MEMBER_EMAIL, firstName: "Doublon", lastName: "Test" },
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("GET /api/spaces/:id/members liste Owner + Member + nouveau membre", async () => {
    const result = await $fetch<{ members: { email: string; roleName: string }[] }>(
      `/api/spaces/${spaceId}/members`,
      { headers: { cookie: ownerCookie } },
    );
    const emails = result.members.map((m) => m.email);
    expect(emails).toEqual(
      expect.arrayContaining([OWNER_EMAIL, MEMBER_EMAIL, NEW_MEMBER_EMAIL]),
    );
    expect(result.members.find((m) => m.email === OWNER_EMAIL)?.roleName).toBe("Owner");
  });

  it("le nouveau membre se connecte avec le mot de passe temporaire puis le change", async () => {
    const login = await $fetch<{ message: string }>("/api/auth/login", {
      method: "POST",
      body: { email: NEW_MEMBER_EMAIL, password: temporaryPassword },
    });
    expect(login.message).toBeTruthy();

    const newMemberLogin = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: NEW_MEMBER_EMAIL, password: temporaryPassword }),
    });
    const newMemberCookie = (newMemberLogin.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

    await $fetch("/api/auth/set-password", {
      method: "POST",
      headers: { cookie: newMemberCookie },
      body: { newPassword: "NouveauMotDePasse123!" },
    });

    await expect(
      $fetch("/api/auth/login", {
        method: "POST",
        body: { email: NEW_MEMBER_EMAIL, password: temporaryPassword },
      }),
    ).rejects.toMatchObject({ statusCode: 401 });

    const relogin = await $fetch<{ message: string }>("/api/auth/login", {
      method: "POST",
      body: { email: NEW_MEMBER_EMAIL, password: "NouveauMotDePasse123!" },
    });
    expect(relogin.message).toBeTruthy();

    const row = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, createdMemberId),
    });
    expect(row?.mustChangePassword).toBe(false);
  });

  it("POST /api/spaces/:id/members vers un espace étranger renvoie 403", async () => {
    await expect(
      $fetch(`/api/spaces/${foreignSpaceId}/members`, {
        method: "POST",
        headers: { cookie: ownerCookie },
        body: { email: "autre@example.com", firstName: "X", lastName: "Y" },
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
