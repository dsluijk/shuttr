import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  await authorize(event, manageFavorites);

  const user = await requireSessionUser(event);

  const db = useDrizzle();
  const favorites = await db
    .select({ photoId: tables.favorite.photoId })
    .from(tables.favorite)
    .where(eq(tables.favorite.userId, user.id));

  return favorites.map((favorite) => favorite.photoId);
});
