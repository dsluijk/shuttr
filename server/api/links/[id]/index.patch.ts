import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const body = await readValidatedBody(event, bodySchema.parse);

  const db = useDrizzle();
  const result = await db
    .update(tables.link)
    .set({
      icon: body.icon,
      to: body.to,
      label: body.label,
    })
    .where(eq(tables.link.id, id))
    .returning();

  if (result.length !== 1 || !result[0]) {
    throw createError({
      statusCode: 404,
      message: "Link not found",
    });
  }

  invalidateSettings();
  return result[0];
});

const paramSchema = z.object({
  id: z.cuid2(),
});

const bodySchema = z.object({
  icon: iconValidator().optional(),
  to: z
    .url({
      error: "A valid URL is required",
      normalize: true,
      protocol: /^(https)|(mailto)$/,
    })
    .max(512)
    .optional(),
  label: z.string().max(32, "Cannot be longer than 32 characters").nullish(),
});
