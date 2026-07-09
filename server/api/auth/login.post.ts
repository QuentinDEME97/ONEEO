import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
});

// Hash de repli utilisé quand l'email n'existe pas, pour que verifyPassword()
// coûte le même temps que pour un utilisateur réel (évite l'énumération par timing).
let dummyPasswordHash: Promise<string> | undefined;
function getDummyPasswordHash() {
  dummyPasswordHash ??= hashPassword(crypto.randomUUID());
  return dummyPasswordHash;
}

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug({ errors: z.treeifyError(parsed.error) }, "login: formulaire invalide");
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const { email, password, rememberMe } = parsed.data;
  const db = useDb();
  const userRecord = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  const passwordValid = await verifyPassword(
    userRecord?.passwordHash ?? (await getDummyPasswordHash()),
    password,
  );

  if (!userRecord || !passwordValid) {
    logger.warn(
      { email, reason: userRecord ? "invalid_password" : "unknown_email" },
      "login refusé",
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Identifiants invalides.",
    });
  }

  logger.info({ userId: userRecord.id, email }, "login réussi");

  await setUserSession(
    event,
    {
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
      },
      rememberMe,
    },
    rememberMe ? { maxAge: SESSION_MAX_AGE } : undefined,
  );

  return { message: "Connexion réussie." };
});
