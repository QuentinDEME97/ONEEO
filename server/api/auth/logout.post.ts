export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  await clearUserSession(event);

  if (user) {
    logger.info({ userId: user.id }, "logout");
  }

  return { message: "Déconnexion réussie." };
});
