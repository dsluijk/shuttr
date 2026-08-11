import { desc } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const body = await readValidatedBody(event, bodySchema.parse);

  const db = useDrizzle();
  const [last] = await db
    .select({ ordering: tables.link.ordering })
    .from(tables.link)
    .orderBy(desc(tables.link.ordering))
    .limit(1);

  const result = await db
    .insert(tables.link)
    .values({
      icon: body.icon,
      to: body.to,
      label: body.label,
      ordering: (last?.ordering ?? -1) + 1,
    })
    .returning();

  if (result.length !== 1 || !result[0]) {
    throw createError({
      statusCode: 500,
      message: "Failed to create the link",
    });
  }

  invalidateSettings();
  return result[0];
});

const bodySchema = z.object({
  icon: iconValidator(),
  to: z
    .url({
      error: "A valid URL is required",
      normalize: true,
      protocol: /^(https)|(mailto)$/,
    })
    .max(512),
  label: z.string().max(32, "Cannot be longer than 32 characters").optional(),
});
