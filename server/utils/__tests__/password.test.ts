import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password";
import { validPasswords, wrongPassword } from "./fixtures/passwords";

describe("hashPassword / verifyPassword", () => {
  it.each(validPasswords)(
    "vérifie correctement le mot de passe %s",
    async (password) => {
      const hash = await hashPassword(password);
      expect(await verifyPassword(password, hash)).toBe(true);
    }
  );

  it("rejette un mauvais mot de passe", async () => {
    const hash = await hashPassword("le-bon-mot-de-passe");
    expect(await verifyPassword(wrongPassword, hash)).toBe(false);
  });

  it("rejette une chaîne vide si ce n'est pas le mot de passe hashé", async () => {
    const hash = await hashPassword("un-mot-de-passe");
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("produit un hash différent à chaque appel (salt aléatoire)", async () => {
    const [hashA, hashB] = await Promise.all([
      hashPassword("meme-mot-de-passe"),
      hashPassword("meme-mot-de-passe"),
    ]);
    expect(hashA).not.toBe(hashB);
    expect(await verifyPassword("meme-mot-de-passe", hashA)).toBe(true);
    expect(await verifyPassword("meme-mot-de-passe", hashB)).toBe(true);
  });

  it("stocke le hash au format `<salt hex>:<hash hex>`", async () => {
    const hash = await hashPassword("format-check");
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("renvoie false pour un hash malformé sans lever d'exception", async () => {
    expect(await verifyPassword("un-mot-de-passe", "hash-invalide")).toBe(
      false
    );
    expect(await verifyPassword("un-mot-de-passe", "")).toBe(false);
  });
});
