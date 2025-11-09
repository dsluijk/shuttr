import * as z from "zod";
import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const accessLevels: Record<AlbumVisibility, boolean> = {
    public: true,
    authenticated: await allows(event, viewAuthenticatedAlbums),
    private: await allows(event, viewPrivateAlbums),
  };

  const db = useDrizzle();
  return await db.query.album.findFirst({
    where: (album, { and, eq, or }) =>
      and(
        eq(album.slug, slug),
        or(
          eq(album.sharingAllowed, true),
          accessLevels.public
            ? eq(album.visibility, AlbumVisibility.PUBLIC)
            : undefined,
          accessLevels.authenticated
            ? eq(album.visibility, AlbumVisibility.AUTHENTICATED)
            : undefined,
          accessLevels.private
            ? eq(album.visibility, AlbumVisibility.PRIVATE)
            : undefined,
        ),
      ),
    with: {
      photos: {
        orderBy: (photo, { asc }) => [asc(photo.dateTime)],
      },
    },
  });
});

const paramSchema = z.object({
  slug: z.string().min(4),
});
