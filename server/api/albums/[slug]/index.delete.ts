import { eq } from "drizzle-orm";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const db = useDrizzle();

  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.slug, slug),
    with: { photos: true },
  });

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  const storage = useStorage();
  let photosDeleted = 0;

  for (const photo of album.photos) {
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
    photosDeleted++;
  }

  const photoDelete = await db
    .delete(tables.photo)
    .where(eq(tables.photo.album, album.id));
  photosDeleted += photoDelete.rowCount ?? 0;

  const albumDelete = await db
    .delete(tables.album)
    .where(eq(tables.album.id, album.id));

  return {
    albumDeleted: (albumDelete.rowCount ?? 0) > 0,
    deletedPhotos: photosDeleted,
  };
});

const paramSchema = z.object({
  slug: z.string().min(4),
});
