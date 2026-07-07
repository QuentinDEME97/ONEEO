import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/**
 * Hash un mot de passe en clair avec `node:crypto` (scrypt).
 * Format de sortie : `<salt hex>:<hash hex>`, salt aléatoire par appel.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/**
 * Vérifie un mot de passe en clair contre un hash produit par `hashPassword()`.
 * Comparaison en temps constant pour éviter les attaques par timing.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await deriveKey(password, salt);

  if (actualKey.length !== expectedKey.length) return false;
  return timingSafeEqual(actualKey, expectedKey);
}
