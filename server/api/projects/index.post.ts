import { z } from "zod";
import { project } from "../../db/schema/project";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  // `null`/absent = hérite du thème de l'espace ; sinon nom d'un thème DaisyUI.
  theme: z.string().trim().min(1).nullish(),
  deliverableLabel: z.string().trim().min(1).optional(),
});

export default defineEventHandler(async (event) => {
  const context = await resolveRequestContext(event);
  const db = useDb();

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    logger.debug(
      { errors: z.treeifyError(parsed.error) },
      "création de projet : formulaire invalide"
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Formulaire invalide.",
      data: z.treeifyError(parsed.error),
    });
  }

  const created = db
    .insert(project)
    .values({
      spaceId: context.spaceId,
      name: parsed.data.name,
      theme: parsed.data.theme ?? null,
      ...(parsed.data.deliverableLabel
        ? { deliverableLabel: parsed.data.deliverableLabel }
        : {}),
    })
    .returning()
    .get();

  await setUserSession(event, { currentProjectId: created.id });
  logger.info(
    { userId: context.userId, spaceId: context.spaceId, projectId: created.id },
    "projet créé"
  );

  return {
    id: created.id,
    name: created.name,
    theme: created.theme,
    deliverableLabel: created.deliverableLabel,
  };
});
