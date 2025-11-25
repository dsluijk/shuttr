import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editLabels);

  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const db = useDrizzle();

  const labelDelete = await db
    .delete(tables.label)
    .where(eq(tables.label.id, id));

  return {
    deleted: (labelDelete.rowCount ?? 0) > 0,
  };
});

const paramSchema = z.object({
  id: z.cuid2(),
});
