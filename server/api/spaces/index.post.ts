import { z } from "zod";
import { space, spaceMembership } from "../../db/schema/identity";

const bodySchema = z.object({
  name: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utilisateur non authentifié.",
    });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug(
      { errors: z.treeifyError(parsed.error) },
      "création d'espace : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const db = useDb();
  const created = db.transaction((tx) => {
    const newSpace = tx
      .insert(space)
      .values({ name: parsed.data.name })
      .returning()
      .get();
    const { ownerRoleId } = ensureSystemRoles(tx, newSpace.id);
    tx.insert(spaceMembership)
      .values({ userId: user.id, spaceId: newSpace.id, roleId: ownerRoleId })
      .run();

    return newSpace;
  });

  await setUserSession(event, { currentSpaceId: created.id });
  logger.info({ userId: user.id, spaceId: created.id }, "espace créé");

  return { id: created.id, name: created.name, theme: created.theme };
});
