import type { H3Event } from "h3";

interface RequestContext {
  userId: string;
  spaceId: string;
  projectId: string | null;
}

export async function resolveRequestContext(
  event: H3Event,
  opts: { spaceId?: string; projectId?: string } = {}
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
    logger.warn(
      { userId: user.id },
      "contexte : aucun espace associé à ce compte"
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Aucun espace associé à ce compte.",
    });
  }

  const spaceId =
    opts.spaceId ?? session.currentSpaceId ?? memberships[0]!.spaceId;
  if (!memberships.some((m) => m.spaceId === spaceId)) {
    logger.warn(
      { userId: user.id, spaceId },
      "contexte : accès à l'espace refusé"
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Accès à cet espace refusé.",
    });
  }

  // Projet actif : cadré à l'espace résolu ci-dessus. On lit en priorité un
  // `projectId` explicite (ex. `POST /api/projects/[id]/select`), sinon celui
  // mémorisé en session, avec repli sur le premier projet de l'espace. Un
  // `projectId` appartenant à un autre espace est rejeté (403) ; un espace sans
  // projet laisse `projectId` à `null`.
  const projects = await db.query.project.findMany({
    where: (p, { eq }) => eq(p.spaceId, spaceId),
  });

  let projectId: string | null;
  if (opts.projectId !== undefined) {
    if (!projects.some((p) => p.id === opts.projectId)) {
      logger.warn(
        { userId: user.id, spaceId, projectId: opts.projectId },
        "contexte : accès au projet refusé"
      );
      throw createError({
        statusCode: 403,
        statusMessage: "Accès à ce projet refusé.",
      });
    }
    projectId = opts.projectId;
  } else {
    const sessionProjectId = session.currentProjectId;
    projectId =
      projects.find((p) => p.id === sessionProjectId)?.id ??
      projects[0]?.id ??
      null;
  }

  logger.debug({ userId: user.id, spaceId, projectId }, "contexte résolu");

  return { userId: user.id, spaceId, projectId };
}
