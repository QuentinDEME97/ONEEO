import { z } from "zod";
import { spaceMembership, user } from "../../../../db/schema/identity";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Identifiant d'espace manquant.",
    });
  }

  const context = await resolveRequestContext(event, { spaceId: id });
  const db = useDb();

  if (!isSpaceOwner(db, context.userId, context.spaceId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Réservé au propriétaire de l'espace.",
    });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug(
      { errors: z.treeifyError(parsed.error) },
      "création de membre : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, parsed.data.email),
  });
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: "Un compte existe déjà avec cet email.",
    });
  }

  const memberRole = await db.query.role.findFirst({
    where: (r, { eq, and }) =>
      and(eq(r.spaceId, context.spaceId), eq(r.name, "Member")),
  });
  if (!memberRole) {
    throw createError({
      statusCode: 500,
      statusMessage: "Rôle Member introuvable pour cet espace.",
    });
  }

  const temporaryPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const passwordHash = await hashPassword(temporaryPassword);

  const created = db.transaction((tx) => {
    const newUser = tx
      .insert(user)
      .values({ ...parsed.data, passwordHash, mustChangePassword: true })
      .returning()
      .get();
    tx.insert(spaceMembership)
      .values({
        userId: newUser.id,
        spaceId: context.spaceId,
        roleId: memberRole.id,
      })
      .run();
    return newUser;
  });

  logger.info(
    { userId: context.userId, spaceId: context.spaceId, newUserId: created.id },
    "membre créé"
  );

  return {
    user: {
      id: created.id,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
    },
    temporaryPassword,
  };
});
