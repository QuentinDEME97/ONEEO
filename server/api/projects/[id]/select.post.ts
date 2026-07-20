export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Identifiant de projet manquant.",
    });
  }

  // `resolveRequestContext` valide que le projet appartient bien à l'espace
  // actif de l'utilisateur (403 sinon) — même délégation que le sélecteur d'espace.
  const context = await resolveRequestContext(event, { projectId: id });
  await setUserSession(event, { currentProjectId: context.projectId });
  logger.info(
    { userId: context.userId, projectId: context.projectId },
    "projet actif changé"
  );

  const db = useDb();
  const selected = await db.query.project.findFirst({
    where: (p, { eq }) => eq(p.id, context.projectId!),
  });

  return {
    id: selected!.id,
    name: selected!.name,
    theme: selected!.theme,
    deliverableLabel: selected!.deliverableLabel,
  };
});
