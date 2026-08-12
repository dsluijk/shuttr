import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editLabels);

  const { ids } = await readValidatedBody(event, bodySchema.parse);
  const db = useDrizzle();
  const labels = await db.select({ id: tables.label.id }).from(tables.label);

  const known = new Set(labels.map((label) => label.id));
  const unique = new Set(ids);
  if (
    unique.size !== ids.length
    || unique.size !== known.size
    || ids.some((id) => !known.has(id))
  ) {
    throw createError({
      statusCode: 400,
      message: "Every label has to be listed exactly once",
    });
  }

  await db.transaction(async (tx) => {
    for (const [ordering, id] of ids.entries()) {
      await tx
        .update(tables.label)
        .set({ ordering })
        .where(eq(tables.label.id, id));
    }
  });

  return await db.query.label.findMany({
    orderBy: (label, { asc }) => [asc(label.ordering), asc(label.title)],
  });
});

const bodySchema = z.object({
  ids: z.array(z.cuid2()).min(1),
});
