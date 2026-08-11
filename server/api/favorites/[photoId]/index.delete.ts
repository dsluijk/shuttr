import { and, eq } from "drizzle-orm";

import * as z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, manageFavorites);

  const user = await requireSessionUser(event);
  const { photoId } = await getValidatedRouterParams(event, paramSchema.parse);

  const db = useDrizzle();
  await db
    .delete(tables.favorite)
    .where(
      and(
        eq(tables.favorite.userId, user.id),
        eq(tables.favorite.photoId, photoId),
      ),
    );

  return;
});

const paramSchema = z.object({
  photoId: z.cuid2(),
});
