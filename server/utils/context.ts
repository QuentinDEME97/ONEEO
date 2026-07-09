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
  const { user } = await getUserSession(event);
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
    throw createError({
      statusCode: 403,
      statusMessage: "Aucun espace associé à ce compte.",
    });
  }

  const spaceId = opts.spaceId ?? memberships[0]!.spaceId;
  if (!memberships.some((m) => m.spaceId === spaceId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Accès à cet espace refusé.",
    });
  }

  // La table `project` n'existe pas encore (tâche 1.8) — toujours nul pour l'instant.
  return { userId: user.id, spaceId, projectId: null };
}
