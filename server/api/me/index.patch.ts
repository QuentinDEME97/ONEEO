import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../../db/schema/identity";

const bodySchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
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
      "mise à jour profil : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const db = useDb();

  // L'email est unique : refuser s'il appartient déjà à un autre compte.
  const emailTaken = await db.query.user.findFirst({
    where: (u, { eq: eqOp, and: andOp, ne: neOp }) =>
      andOp(eqOp(u.email, parsed.data.email), neOp(u.id, sessionUser.id)),
  });

  if (emailTaken) {
    throw createError({
      statusCode: 409,
      statusMessage: "Un compte existe déjà avec cet email.",
    });
  }

  const updated = db
    .update(user)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
    })
    .where(eq(user.id, sessionUser.id))
    .returning()
    .get();

  await setUserSession(event, {
    user: {
      ...sessionUser,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
    },
  });
  logger.info({ userId: sessionUser.id }, "profil mis à jour");

  return {
    user: {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarPath: updated.avatarPath,
    },
  };
});
