import { eq } from "drizzle-orm";
import { role, spaceMembership, user } from "../../../../db/schema/identity";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Identifiant d'espace manquant.",
    });
  }

  const context = await resolveRequestContext(event, { spaceId: id });
  const db = useDb();

  const members = await db
    .select({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
      roleName: role.name,
    })
    .from(spaceMembership)
    .innerJoin(user, eq(spaceMembership.userId, user.id))
    .innerJoin(role, eq(spaceMembership.roleId, role.id))
    .where(eq(spaceMembership.spaceId, context.spaceId));

  return { members };
});
