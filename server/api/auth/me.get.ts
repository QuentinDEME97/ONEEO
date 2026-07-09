export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const spaceId = typeof query.spaceId === "string" ? query.spaceId : undefined;

  const context = await resolveRequestContext(event, { spaceId });
  const { user } = await getUserSession(event);

  return {
    user: {
      id: user!.id,
      email: user!.email,
      firstName: user!.firstName,
      lastName: user!.lastName,
    },
    spaceId: context.spaceId,
    projectId: context.projectId,
  };
});
