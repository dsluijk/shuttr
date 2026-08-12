import * as z from "zod";
import slugify from "slugify";
import { init as cuid2 } from "@paralleldrive/cuid2";
import { and, eq, not } from "drizzle-orm";

import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const body = await readValidatedBody(event, bodySchema.parse);
  const db = useDrizzle();

  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.slug, slug),
    with: { cover: true },
  });

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  let selectedLabels: (typeof tables.label.$inferSelect)[] = [];
  if ((body.labels?.length ?? 0) > 0) {
    selectedLabels = await db.query.label.findMany({
      where: (label, { eq, or }) =>
        or(...(body.labels?.map((labelId) => eq(label.id, labelId)) ?? [])),
    });
  }

  if (
    body.labels !== undefined
    && selectedLabels.length !== body.labels?.length
  ) {
    throw createError({
      statusCode: 400,
      message: "Not all labels provided actually exist",
    });
  }

  let newSlug = undefined;
  if (body.title !== undefined && body.title !== album.title) {
    newSlug =
      cuid2({
        length: 6,
      })()
      + "-"
      + slugify(body.title, {
        lower: true,
        strict: true,
      });
  }

  return await db.transaction(async (tx) => {
    const result = await tx
      .update(tables.album)
      .set({
        title: body.title,
        slug: newSlug,
        description: body.description,
        startDate: body.date?.start,
        endDate: body.date?.end,
        visibility: body.visibility,
        sharingAllowed:
          body.visibility !== "public" ? body.sharingAllowed : true,
      })
      .where(eq(tables.album.id, album.id))
      .returning();

    if (result.length !== 1 || !result[0]) {
      tx.rollback();
      throw createError({
        statusCode: 500,
        message: "Failed to update album",
      });
    }
    const updatedAlbum = result[0];

    await tx
      .delete(tables.albumLabels)
      .where(
        and(
          ...(body.labels?.map((labelId) =>
            not(eq(tables.albumLabels.labelId, labelId)),
          ) ?? []),
          eq(tables.albumLabels.albumId, updatedAlbum.id),
        ),
      );

    let albumLabels = await tx.query.albumLabels.findMany({
      where: (albumLabels, { eq }) => eq(albumLabels.albumId, updatedAlbum.id),
    });

    const newLabels = [];
    for (const selectedLabel of selectedLabels) {
      if (albumLabels.find(({ labelId }) => labelId == selectedLabel.id)) {
        continue;
      }

      newLabels.push({
        albumId: updatedAlbum.id,
        labelId: selectedLabel.id,
      });
    }

    if (newLabels.length > 0) {
      const newAlbumLabels = await tx
        .insert(tables.albumLabels)
        .values(newLabels)
        .returning();
      albumLabels = albumLabels.concat(newAlbumLabels);
    }

    return {
      ...updatedAlbum,
      cover: album.cover,
      albumLabels: albumLabels
        .map((albumLabel) => ({
          ...albumLabel,
          label: selectedLabels.find(
            (selected) => albumLabel.labelId === selected.id,
          ) as typeof tables.label.$inferSelect,
        }))
        .sort(
          (a, b) =>
            a.label.ordering - b.label.ordering
            || a.label.title.localeCompare(b.label.title),
        ),
    };
  });
});

const paramSchema = z.object({
  slug: z.string().min(4),
});

const bodySchema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(64, "Cannot be longer than 64 characters")
    .optional(),
  description: z
    .string("You must specify a description")
    .max(512, "Cannot be longer than 512 characters")
    .optional(),
  date: z
    .object({
      start: z.coerce
        .date()
        .refine((date) => date <= new Date(), "Date cannot be in the future.")
        .refine(
          (date) =>
            date.getUTCHours() === 0
            && date.getUTCMinutes() === 0
            && date.getUTCSeconds() === 0,
          "Time must be at midnight.",
        ),
      end: z.coerce
        .date()
        .refine((date) => date <= new Date(), "Date cannot be in the future.")
        .refine(
          (date) =>
            date.getUTCHours() === 0
            && date.getUTCMinutes() === 0
            && date.getUTCSeconds() === 0,
          "Time must be at midnight.",
        ),
    })
    .refine(({ start, end }) => start <= end)
    .optional(),
  labels: z.array(z.cuid2()).max(4).optional(),
  visibility: z.enum(AlbumVisibility).optional(),
  sharingAllowed: z.boolean().optional(),
});
