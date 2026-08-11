import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const db = useDrizzle();

  const linkDelete = await db.delete(tables.link).where(eq(tables.link.id, id));

  invalidateSettings();
  return {
    deleted: (linkDelete.rowCount ?? 0) > 0,
  };
});

const paramSchema = z.object({
  id: z.cuid2(),
});
