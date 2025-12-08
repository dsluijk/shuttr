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

  return await db
    .update(tables.album)
    .set({ published: false })
    .where(eq(tables.album.id, album.id))
    .returning();
});

const paramSchema = z.object({
  slug: z.string().min(4),
});
