export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Identifiant d'espace manquant.",
    });
  }

  const context = await resolveRequestContext(event, { spaceId: id });
  await setUserSession(event, { currentSpaceId: context.spaceId });
  logger.info(
    { userId: context.userId, spaceId: context.spaceId },
    "espace actif changé"
  );

  const db = useDb();
  const selected = await db.query.space.findFirst({
    where: (s, { eq }) => eq(s.id, context.spaceId),
  });

  return { id: selected!.id, name: selected!.name, theme: selected!.theme };
});
