export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event);
  if (!sessionUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utilisateur non authentifié.",
    });
  }

  const db = useDb();
  const record = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, sessionUser.id),
  });
  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: "Utilisateur introuvable.",
    });
  }

  return {
    user: {
      id: record.id,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      avatarPath: record.avatarPath,
    },
  };
});
