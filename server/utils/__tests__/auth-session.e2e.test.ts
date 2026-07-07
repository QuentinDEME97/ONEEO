import { fileURLToPath } from "node:url";
import { $fetch, fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vitest";

describe("e2e — session (nuxt-auth-utils)", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../..", import.meta.url)),
    dev: true,
    server: true,
  });

  it("GET /api/_auth/session renvoie une session vide (sans utilisateur) sans cookie", async () => {
    const session = await $fetch("/api/_auth/session");
    // h3 attribue toujours un id de session ; seul `user` matérialise une connexion.
    expect(session).not.toHaveProperty("user");
    expect(typeof (session as { id: string }).id).toBe("string");
  });

  it("DELETE /api/_auth/session déconnecte et vide le cookie de session", async () => {
    const response = await fetch("/api/_auth/session", { method: "DELETE" });

    expect(await response.json()).toEqual({ loggedOut: true });

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("nuxt-session=;");
  });
});
