import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { eq } from "drizzle-orm";
import { user } from "../../db/schema/identity";

// Avatars stockés sur disque (dossier `data/avatars`, chemin en base) — pas de
// base64 en BDD (voir Points d'attention du DEVELOPMENT.md). Servis par la
// route publique `server/routes/avatars/[file].get.ts`.
const AVATARS_DIR = "data/avatars";
const MAX_BYTES = 2 * 1024 * 1024; // 2 Mo
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event);
  if (!sessionUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utilisateur non authentifié.",
    });
  }

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((p) => p.name === "avatar" && p.filename);
  if (!filePart) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucun fichier reçu.",
    });
  }

  const extension = filePart.type
    ? EXTENSION_BY_MIME[filePart.type]
    : undefined;
  if (!extension) {
    throw createError({
      statusCode: 400,
      statusMessage: "Format d'image non supporté (png, jpg, webp, gif).",
    });
  }

  if (filePart.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image trop volumineuse (2 Mo maximum).",
    });
  }

  const fileName = `${sessionUser.id}-${randomUUID()}.${extension}`;
  await mkdir(AVATARS_DIR, { recursive: true });
  await writeFile(join(AVATARS_DIR, fileName), filePart.data);

  const db = useDb();
  const previous = await db.query.user.findFirst({
    where: (u, { eq: eqOp }) => eqOp(u.id, sessionUser.id),
  });

  const avatarPath = `/avatars/${fileName}`;
  db.update(user)
    .set({ avatarPath })
    .where(eq(user.id, sessionUser.id))
    .run();

  await setUserSession(event, {
    user: { ...sessionUser, avatarPath },
  });

  // Purge de l'ancien fichier (le nom change à chaque upload pour casser le
  // cache navigateur) — sans bloquer si le fichier a déjà disparu.
  const previousPath = previous?.avatarPath;
  if (previousPath?.startsWith("/avatars/")) {
    await unlink(join(AVATARS_DIR, basename(previousPath))).catch(() => {});
  }

  logger.info({ userId: sessionUser.id }, "avatar mis à jour");

  return { avatarPath };
});
