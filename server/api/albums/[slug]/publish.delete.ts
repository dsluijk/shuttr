import { eq } from "drizzle-orm";
import z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
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

  if (!album.published) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album was not published",
    });
  }

  const result = await db
    .update(tables.album)
    .set({ published: false })
    .where(eq(tables.album.id, album.id))
    .returning();

  if (result.length == 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  return result[0];
});

const paramSchema = z.object({
  slug: z.string().min(4),
});
