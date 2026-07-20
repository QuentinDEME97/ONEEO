import { eq } from "drizzle-orm";
import { project } from "../../db/schema/project";

export default defineEventHandler(async (event) => {
  const context = await resolveRequestContext(event);
  const db = useDb();

  const projects = await db
    .select({
      id: project.id,
      name: project.name,
      theme: project.theme,
      deliverableLabel: project.deliverableLabel,
    })
    .from(project)
    .where(eq(project.spaceId, context.spaceId));

  return { projects, currentProjectId: context.projectId };
});
