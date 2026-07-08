import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
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

  if (
    !userRecord ||
    !(await verifyPassword(userRecord.passwordHash, password))
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: "Identifiants invalides.",
    });
  }

  const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

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
