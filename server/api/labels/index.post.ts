import * as z from "zod";
import { icons as lucideIcons } from "@iconify-json/lucide";

import { LabelStyle } from "~~/server/database/schema/label";

export default defineEventHandler(async (event) => {
  await authorize(event, editLabels);

  const body = await readValidatedBody(event, bodySchema.parse);

  const db = useDrizzle();
  const result = await db
    .insert(tables.label)
    .values({
      title: body.title,
      style: body.style,
      icon: body.icon,
      color: body.color,
    })
    .returning();

  if (result.length !== 1) {
    throw createError({
      statusCode: 500,
      message: "Failed to create label",
    });
  }

  return result[0];
});

const iconOptions = Object.keys(lucideIcons.icons).map(
  (icon) => `i-lucide-${icon}`,
);
const bodySchema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(24, "Cannot be longer than 24 characters"),
  style: z.enum(LabelStyle),
  icon: z.literal(iconOptions).optional(),
  color: readableColorValidator().optional(),
});
