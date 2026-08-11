import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { ids } = await readValidatedBody(event, bodySchema.parse);
  const { links } = await getSettings();

  const known = new Set(links.map((link) => link.id));
  const unique = new Set(ids);
  if (
    unique.size !== ids.length
    || unique.size !== known.size
    || ids.some((id) => !known.has(id))
  ) {
    throw createError({
      statusCode: 400,
      message: "Every link has to be listed exactly once",
    });
  }

  const db = useDrizzle();
  await db.transaction(async (tx) => {
    for (const [ordering, id] of ids.entries()) {
      await tx
        .update(tables.link)
        .set({ ordering })
        .where(eq(tables.link.id, id));
    }
  });

  invalidateSettings();
  return (await getSettings()).links;
});

const bodySchema = z.object({
  ids: z.array(z.cuid2()).min(1),
});
