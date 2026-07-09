import { z } from "zod";
import { space, spaceMembership, user } from "../db/schema/identity";

const bodySchema = z.object({
  spaceName: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const db = useDb();

  if (hasAnyUser(db)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Le premier lancement a déjà été effectué.",
    });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug({ errors: parsed.error.flatten() }, "setup: formulaire invalide");
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: parsed.error.flatten(),
    });
  }

  const { spaceName, firstName, lastName, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  const created = db.transaction((tx) => {
    const newSpace = tx
      .insert(space)
      .values({ name: spaceName })
      .returning()
      .get();
    const { ownerRoleId } = ensureSystemRoles(tx, newSpace.id);
    const newUser = tx
      .insert(user)
      .values({ email, passwordHash, firstName, lastName })
      .returning()
      .get();
    tx.insert(spaceMembership)
      .values({ userId: newUser.id, spaceId: newSpace.id, roleId: ownerRoleId })
      .run();

    return { space: newSpace, user: newUser };
  });

  logger.info(
    { userId: created.user.id, spaceId: created.space.id },
    "premier lancement : espace et administrateur créés",
  );

  await setUserSession(event, {
    user: {
      id: created.user.id,
      email: created.user.email,
      firstName: created.user.firstName,
      lastName: created.user.lastName,
    },
  });

  return {
    user: {
      id: created.user.id,
      email: created.user.email,
      firstName: created.user.firstName,
      lastName: created.user.lastName,
    },
    space: { id: created.space.id, name: created.space.name },
  };
});
