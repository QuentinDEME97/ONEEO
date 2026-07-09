import { eq } from "drizzle-orm";
import { space, spaceMembership } from "../../db/schema/identity";

export default defineEventHandler(async (event) => {
  const context = await resolveRequestContext(event);
  const db = useDb();

  const spaces = await db
    .select({ id: space.id, name: space.name, theme: space.theme })
    .from(spaceMembership)
    .innerJoin(space, eq(spaceMembership.spaceId, space.id))
    .where(eq(spaceMembership.userId, context.userId));

  return { spaces, currentSpaceId: context.spaceId };
});
