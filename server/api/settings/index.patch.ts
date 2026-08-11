import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const body = await readValidatedBody(event, bodySchema.parse);
  const { links: _links, id: _id, ...current } = await getSettings();
  const values = { ...current, ...body };

  const db = useDrizzle();
  const result = await db
    .insert(tables.setting)
    .values({ id: true, ...values })
    .onConflictDoUpdate({ target: tables.setting.id, set: values })
    .returning();

  if (result.length !== 1 || !result[0]) {
    throw createError({
      statusCode: 500,
      message: "Failed to update the settings",
    });
  }

  invalidateSettings();
  return await getSettings();
});

const bodySchema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(32, "Cannot be longer than 32 characters")
    .optional(),
  header: z
    .string("A header is required")
    .min(2, "Must be at least 2 characters")
    .max(64, "Cannot be longer than 64 characters")
    .optional(),
  description: z
    .string("A description is required")
    .min(2, "Must be at least 2 characters")
    .max(512, "Cannot be longer than 512 characters")
    .optional(),
  primaryColor: primaryColorValidator().optional(),
  neutralColor: neutralColorValidator().optional(),
});
