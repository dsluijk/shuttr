import * as z from "zod";
import slugify from "slugify";

import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const body = await readValidatedBody(event, bodySchema.parse);
  const slug = slugify(body.title, {
    lower: true,
    strict: true,
  });

  const db = useDrizzle();
  const existingLabels = await db.query.label.findMany({
    where: (label, { eq, or }) =>
      or(...body.labels.map((labelId) => eq(label.id, labelId))),
  });

  if (existingLabels.length !== body.labels.length) {
    throw createError({
      statusCode: 400,
      message: "Not all labels provided actually exist",
    });
  }

  return await db.transaction(async (tx) => {
    const result = await tx
      .insert(tables.album)
      .values({
        title: body.title,
        slug,
        description: body.description,
        startDate: body.date.start,
        endDate: body.date.end,
        visibility: body.visibility,
        sharingAllowed:
          body.visibility !== "public" ? body.sharingAllowed : true,
      })
      .returning();

    if (result.length !== 1 || !result[0]) {
      tx.rollback();
      throw createError({
        statusCode: 500,
        message: "Failed to create album",
      });
    }
    const createdAlbum = result[0];

    const labelResult = await tx
      .insert(tables.albumLabels)
      .values(
        existingLabels.map((label) => ({
          albumId: createdAlbum.id,
          labelId: label.id,
        })),
      )
      .returning();

    return {
      ...createdAlbum,
      labels: labelResult.map((label) => ({
        ...label,
        label: existingLabels.find((existing) => label.labelId === existing.id),
      })),
    };
  });
});

const bodySchema = z.object({
  title: z
    .string("A title is required")
    .min(4, "Must be at least 4 characters")
    .max(64, "Cannot be longer than 64 characters"),
  description: z
    .string("You must specify a description")
    .min(6, "Must be at least 6 characters")
    .max(512, "Cannot be longer than 512 characters"),
  date: z
    .object({
      start: z.coerce
        .date()
        .max(new Date())
        .refine(
          (date) =>
            date.getUTCHours() === 0
            && date.getUTCMinutes() === 0
            && date.getUTCSeconds() === 0,
          "Time must be at midnight.",
        ),
      end: z.coerce
        .date()
        .max(new Date())
        .refine(
          (date) =>
            date.getUTCHours() === 0
            && date.getUTCMinutes() === 0
            && date.getUTCSeconds() === 0,
          "Time must be at midnight.",
        ),
    })
    .refine(({ start, end }) => start <= end),
  labels: z.array(z.cuid2()).max(4),
  visibility: z.enum(AlbumVisibility),
  sharingAllowed: z.boolean(),
});
