import { eq } from "drizzle-orm";

import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const { photoId } = await readValidatedBody(event, bodySchema.parse);
  const db = useDrizzle();

  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.slug, slug),
  });

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  const photo = await db.query.photo.findFirst({
    where: (photo, { eq }) => eq(photo.id, photoId),
    columns: {
      location: false,
    },
  });

  if (!photo) {
    throw createError({
      statusCode: 404,
      statusMessage: "Photo not found",
    });
  }

  if (album.id !== photo.album) {
    throw createError({
      statusCode: 400,
      statusMessage: "Photo is not in this album",
    });
  }

  await db
    .update(tables.album)
    .set({ coverPhoto: photo.id })
    .where(eq(tables.album.id, album.id));

  return photo;
});

const paramSchema = z.object({
  slug: z.string().min(4),
});

const bodySchema = z.object({
  photoId: z.cuid2(),
});
