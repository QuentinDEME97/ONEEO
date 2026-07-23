import { fileURLToPath } from "node:url";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { user } from "../../../db/schema/identity";
import { useDb } from "../../../utils/db";

// Hash PHC pour "Test1234!" — précalculé (format auto-porteur), même astuce que
// members.e2e.test.ts : `hashPassword()` dépend du runtime Nitro.
const TEST_PASSWORD_HASH =
  "$scrypt$n=16384,r=8,p=1$d3lPuIVrTghwGJcoy5TufQ$/a1u7fLdCnHuJmM26+jDKHxqDQF4LIdw/kiXxF4cdRnPF2PWjt9ADOtuknFOxywVH0qj3F2HR6I3Y0gBLCcl+w";
const TEST_PASSWORD = "Test1234!";
const ME_EMAIL = `me-e2e-${Date.now()}@example.com`;
const OTHER_EMAIL = `me-other-e2e-${Date.now()}@example.com`;

// Un PNG 1×1 transparent minimal (base64) pour tester l'upload d'avatar.
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC",
  "base64"
);

describe("e2e — profil (server/api/me)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  const db = useDb();
  let meId: string;
  let meCookie: string;
  // L'email évolue au fil des tests (PATCH) : on suit la valeur courante pour
  // les (re)connexions ultérieures.
  let currentEmail = ME_EMAIL;

  beforeAll(async () => {
    const created = db
      .insert(user)
      .values({
        email: ME_EMAIL,
        passwordHash: TEST_PASSWORD_HASH,
        firstName: "Moi",
        lastName: "Test",
      })
      .returning()
      .get();
    meId = created.id;

    db.insert(user)
      .values({
        email: OTHER_EMAIL,
        passwordHash: TEST_PASSWORD_HASH,
        firstName: "Autre",
        lastName: "Test",
      })
      .run();

    const login = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: ME_EMAIL, password: TEST_PASSWORD }),
    });
    meCookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
  });

  afterAll(() => {
    db.delete(user).where(eq(user.id, meId)).run();
    db.delete(user).where(eq(user.email, OTHER_EMAIL)).run();
  });

  it("GET /api/me sans session renvoie 401", async () => {
    await expect($fetch("/api/me")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("GET /api/me renvoie le profil courant", async () => {
    const result = await $fetch<{
      user: { id: string; email: string; firstName: string };
    }>("/api/me", { headers: { cookie: meCookie } });
    expect(result.user.id).toBe(meId);
    expect(result.user.email).toBe(ME_EMAIL);
    expect(result.user.firstName).toBe("Moi");
  });

  it("PATCH /api/me met à jour nom / prénom / email", async () => {
    const newEmail = `me-updated-e2e-${Date.now()}@example.com`;
    const result = await $fetch<{ user: { firstName: string; email: string } }>(
      "/api/me",
      {
        method: "PATCH",
        headers: { cookie: meCookie },
        body: { firstName: "Nouveau", lastName: "Nom", email: newEmail },
      }
    );
    expect(result.user.firstName).toBe("Nouveau");
    expect(result.user.email).toBe(newEmail);
    currentEmail = newEmail;

    const row = await db.query.user.findFirst({
      where: (u, { eq: eqOp }) => eqOp(u.id, meId),
    });
    expect(row?.email).toBe(newEmail);
  });

  it("PATCH /api/me vers un email déjà pris renvoie 409", async () => {
    await expect(
      $fetch("/api/me", {
        method: "PATCH",
        headers: { cookie: meCookie },
        body: { firstName: "X", lastName: "Y", email: OTHER_EMAIL },
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("POST /api/me/password avec un mauvais mot de passe actuel renvoie 400", async () => {
    await expect(
      $fetch("/api/me/password", {
        method: "POST",
        headers: { cookie: meCookie },
        body: { currentPassword: "MauvaisMotDePasse", newPassword: "Nouveau1234!" },
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("POST /api/me/password change le mot de passe après vérification de l'ancien", async () => {
    await $fetch("/api/me/password", {
      method: "POST",
      headers: { cookie: meCookie },
      body: { currentPassword: TEST_PASSWORD, newPassword: "Nouveau1234!" },
    });

    await expect(
      $fetch("/api/auth/login", {
        method: "POST",
        body: { email: currentEmail, password: TEST_PASSWORD },
      })
    ).rejects.toMatchObject({ statusCode: 401 });

    const relogin = await $fetch<{ message: string }>("/api/auth/login", {
      method: "POST",
      body: { email: currentEmail, password: "Nouveau1234!" },
    });
    expect(relogin.message).toBeTruthy();
  });

  it("POST /api/me/avatar stocke l'avatar et le sert via /avatars/:file", async () => {
    const body = new FormData();
    body.append("avatar", new Blob([PNG_1PX], { type: "image/png" }), "a.png");

    const result = await $fetch<{ avatarPath: string }>("/api/me/avatar", {
      method: "POST",
      headers: { cookie: meCookie },
      body,
    });
    expect(result.avatarPath).toMatch(/^\/avatars\/.+\.png$/);

    const served = await fetch(result.avatarPath, {
      headers: { cookie: meCookie },
    });
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("image/png");
  });
});
