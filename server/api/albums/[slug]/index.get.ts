import * as z from "zod";

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);

  const db = useDrizzle();
  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.slug, slug),
    with: {
      cover: {
        columns: {
          location: false,
        },
      },
      photos: {
        orderBy: (photo, { asc }) => [asc(photo.dateTime)],
        columns: {
          location: false,
        },
      },
      albumLabels: { with: { label: true } },
    },
  });

  if (!album || !(await allows(event, viewAlbum, album, true))) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  return album;
});

const paramSchema = z.object({
  slug: z.string().min(4),
});
