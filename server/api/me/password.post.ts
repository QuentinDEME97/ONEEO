import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../../db/schema/identity";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event);
  if (!sessionUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utilisateur non authentifié.",
    });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug(
      { errors: z.treeifyError(parsed.error) },
      "changement mot de passe : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const db = useDb();
  const record = await db.query.user.findFirst({
    where: (u, { eq: eqOp }) => eqOp(u.id, sessionUser.id),
  });
  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: "Utilisateur introuvable.",
    });
  }

  // ⚠️ signature : verifyPassword(hash, plain) — le hash en premier (voir note 1.2).
  const currentValid = await verifyPassword(
    record.passwordHash,
    parsed.data.currentPassword
  );
  if (!currentValid) {
    logger.warn(
      { userId: sessionUser.id },
      "changement mot de passe : ancien mot de passe invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Mot de passe actuel incorrect.",
    });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  db.update(user)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(user.id, sessionUser.id))
    .run();

  await setUserSession(event, {
    user: { ...sessionUser, mustChangePassword: false },
  });
  logger.info({ userId: sessionUser.id }, "mot de passe changé depuis le profil");

  return { message: "Mot de passe mis à jour." };
});
