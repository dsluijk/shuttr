import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, manageFavorites);

  const user = await requireSessionUser(event);
  const { photoId } = await getValidatedRouterParams(event, paramSchema.parse);

  const db = useDrizzle();
  const photo = await db.query.photo.findFirst({
    where: (photo, { eq }) => eq(photo.id, photoId),
    columns: { location: false },
    with: { album: true },
  });

  if (!photo || !(await allows(event, viewAlbum, photo.album, true))) {
    throw createError({
      statusCode: 404,
      statusMessage: "Photo not found",
    });
  }

  await db
    .insert(tables.favorite)
    .values({ userId: user.id, photoId: photo.id })
    .onConflictDoNothing();

  return;
});

const paramSchema = z.object({
  photoId: z.cuid2(),
});
