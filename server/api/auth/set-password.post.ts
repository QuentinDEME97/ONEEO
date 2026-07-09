import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../../db/schema/identity";

const bodySchema = z.object({
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
      "set-password : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const db = useDb();
  db.update(user)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(user.id, sessionUser.id))
    .run();

  await setUserSession(event, {
    user: { ...sessionUser, mustChangePassword: false },
  });
  logger.info({ userId: sessionUser.id }, "mot de passe changé");

  return { message: "Mot de passe mis à jour." };
});
