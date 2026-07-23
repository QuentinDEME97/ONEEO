import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

// Sert les avatars stockés sur disque (`data/avatars`). Réservé aux utilisateurs
// connectés ; le nom de fichier est réduit à son basename pour interdire toute
// remontée de chemin (`../`).
const AVATARS_DIR = "data/avatars";
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const file = basename(getRouterParam(event, "file") ?? "");
  const contentType = CONTENT_TYPE_BY_EXT[extname(file).toLowerCase()];
  if (!file || !contentType) {
    throw createError({ statusCode: 404, statusMessage: "Avatar introuvable." });
  }

  let data: Buffer;
  try {
    data = await readFile(join(AVATARS_DIR, file));
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Avatar introuvable." });
  }

  setResponseHeader(event, "content-type", contentType);
  setResponseHeader(event, "cache-control", "private, max-age=31536000, immutable");
  return data;
});
