import { eq } from "drizzle-orm";

import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug, photoId } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
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
  });

  if (!photo) {
    throw createError({
      statusCode: 404,
      statusMessage: "Photo not found",
    });
  }

  if (album.coverPhoto === photo.id) {
    await db
      .update(tables.album)
      .set({ coverPhoto: null })
      .where(eq(tables.album.id, album.id));
  }

  const storage = useStorage();

  for (const storageKey of [
    `storage:photo:${album.id}:${photo.id}:large`,
    `storage:photo:${album.id}:${photo.id}:original`,
    `temp:photo:${album.id}:${photo.id}:thumb`,
  ]) {
    if (!(await storage.has(storageKey))) {
      continue;
    }

    await storage.remove(storageKey);
  }

  await db.delete(tables.photo).where(eq(tables.photo.id, photo.id));
  return;
});

const paramSchema = z.object({
  slug: z.string().min(4),
  photoId: z.cuid2(),
});
