import { fileURLToPath } from "node:url";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { space, spaceMembership, user } from "../../../db/schema/identity";
import { project } from "../../../db/schema/project";
import { useDb } from "../../../utils/db";
import { ensureSystemRoles } from "../../../utils/roles";

// Hash PHC pour le mot de passe "Test1234!" — précalculé (format auto-porteur,
// vérifiable indépendamment de la config runtime) car `hashPassword()` dépend
// de `useRuntimeConfig()` et n'est pas utilisable hors du process Nitro.
const TEST_PASSWORD_HASH =
  "$scrypt$n=16384,r=8,p=1$d3lPuIVrTghwGJcoy5TufQ$/a1u7fLdCnHuJmM26+jDKHxqDQF4LIdw/kiXxF4cdRnPF2PWjt9ADOtuknFOxywVH0qj3F2HR6I3Y0gBLCcl+w";
const TEST_PASSWORD = "Test1234!";
const TEST_EMAIL = `projects-e2e-${Date.now()}@example.com`;

describe("e2e — projets (server/api/projects)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  const db = useDb();
  let memberSpaceId: string;
  let foreignSpaceId: string;
  let initialProjectId: string;
  let foreignProjectId: string;
  let createdProjectId: string;
  let cookie: string;

  beforeAll(async () => {
    const created = db.transaction((tx) => {
      const memberSpace = tx
        .insert(space)
        .values({ name: "Espace test 1.9" })
        .returning()
        .get();
      const { ownerRoleId } = ensureSystemRoles(tx, memberSpace.id);
      const newUser = tx
        .insert(user)
        .values({
          email: TEST_EMAIL,
          passwordHash: TEST_PASSWORD_HASH,
          firstName: "Test",
          lastName: "Projets",
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
      const initialProject = tx
        .insert(project)
        .values({ spaceId: memberSpace.id, name: "Projet initial" })
        .returning()
        .get();

      const foreignSpace = tx
        .insert(space)
        .values({ name: "Espace étranger 1.9" })
        .returning()
        .get();
      ensureSystemRoles(tx, foreignSpace.id);
      const foreignProject = tx
        .insert(project)
        .values({ spaceId: foreignSpace.id, name: "Projet étranger" })
        .returning()
        .get();

      return { memberSpace, foreignSpace, initialProject, foreignProject };
    });

    memberSpaceId = created.memberSpace.id;
    foreignSpaceId = created.foreignSpace.id;
    initialProjectId = created.initialProject.id;
    foreignProjectId = created.foreignProject.id;

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

  it("GET /api/projects sans session renvoie 401", async () => {
    await expect($fetch("/api/projects")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("GET /api/projects liste les projets de l'espace actif", async () => {
    const result = await $fetch<{
      projects: { id: string }[];
      currentProjectId: string;
    }>("/api/projects", { headers: { cookie } });
    // À défaut de projet mémorisé en session, le contexte retombe sur le
    // premier projet de l'espace.
    expect(result.currentProjectId).toBe(initialProjectId);
    expect(result.projects.map((p) => p.id)).toEqual([initialProjectId]);
  });

  it("POST /api/projects crée un projet dans l'espace actif et bascule dessus", async () => {
    // Comme pour les espaces, `setUserSession` renvoie un cookie re-signé qu'il
    // faut recapturer (`$fetch` ne persiste pas les cookies entre appels).
    const createResponse = await fetch("/api/projects", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ name: "Nouveau projet", theme: "dark" }),
    });
    const createdProject = (await createResponse.json()) as {
      id: string;
      name: string;
      theme: string | null;
    };
    cookie =
      (createResponse.headers.get("set-cookie") ?? "").split(";")[0] ?? cookie;
    createdProjectId = createdProject.id;
    expect(createdProject.name).toBe("Nouveau projet");
    expect(createdProject.theme).toBe("dark");

    const result = await $fetch<{
      projects: { id: string }[];
      currentProjectId: string;
    }>("/api/projects", { headers: { cookie } });
    expect(result.currentProjectId).toBe(createdProjectId);
    expect(result.projects.map((p) => p.id).sort()).toEqual(
      [initialProjectId, createdProjectId].sort()
    );
  });

  it("POST /api/projects/:id/select rebascule sur le projet initial", async () => {
    const selectResponse = await fetch(
      `/api/projects/${initialProjectId}/select`,
      { method: "POST", headers: { cookie } }
    );
    const selected = (await selectResponse.json()) as { id: string };
    cookie =
      (selectResponse.headers.get("set-cookie") ?? "").split(";")[0] ?? cookie;
    expect(selected.id).toBe(initialProjectId);

    const result = await $fetch<{ currentProjectId: string }>("/api/projects", {
      headers: { cookie },
    });
    expect(result.currentProjectId).toBe(initialProjectId);
  });

  it("POST /api/projects/:id/select vers un projet d'un autre espace renvoie 403", async () => {
    await expect(
      $fetch(`/api/projects/${foreignProjectId}/select`, {
        method: "POST",
        headers: { cookie },
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
