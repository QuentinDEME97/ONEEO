import type { H3Event } from "h3";

interface RequestContext {
  userId: string;
  spaceId: string;
  projectId: string | null;
}

export async function resolveRequestContext(
  event: H3Event,
  opts: { spaceId?: string } = {},
): Promise<RequestContext> {
  const session = await getUserSession(event);
  const { user } = session;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utilisateur non authentifié.",
    });
  }

  const db = useDb();
  const memberships = await db.query.spaceMembership.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
  });

  if (memberships.length === 0) {
    logger.warn({ userId: user.id }, "contexte : aucun espace associé à ce compte");
    throw createError({
      statusCode: 403,
      statusMessage: "Aucun espace associé à ce compte.",
    });
  }

  const spaceId = opts.spaceId ?? session.currentSpaceId ?? memberships[0]!.spaceId;
  if (!memberships.some((m) => m.spaceId === spaceId)) {
    logger.warn({ userId: user.id, spaceId }, "contexte : accès à l'espace refusé");
    throw createError({
      statusCode: 403,
      statusMessage: "Accès à cet espace refusé.",
    });
  }

  logger.debug({ userId: user.id, spaceId }, "contexte résolu");

  // La table `project` n'existe pas encore (tâche 1.8) — toujours nul pour l'instant.
  return { userId: user.id, spaceId, projectId: null };
}
