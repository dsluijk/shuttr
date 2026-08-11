import { and, desc, eq, getTableColumns, or } from "drizzle-orm";
import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  await authorize(event, manageFavorites);

  const user = await requireSessionUser(event);

  const accessLevels: Record<AlbumVisibility, boolean> = {
    public: true,
    authenticated: await allows(event, viewAuthenticatedAlbums),
    private: await allows(event, viewPrivateAlbums),
  };
  const unpublished = await allows(event, editAlbums);

  const { location: _location, ...photoColumns } = getTableColumns(
    tables.photo,
  );

  const db = useDrizzle();
  return await db
    .select(photoColumns)
    .from(tables.favorite)
    .innerJoin(tables.photo, eq(tables.photo.id, tables.favorite.photoId))
    .innerJoin(tables.album, eq(tables.album.id, tables.photo.album))
    .where(
      and(
        eq(tables.favorite.userId, user.id),
        !unpublished ? eq(tables.album.published, true) : undefined,
        or(
          eq(tables.album.sharingAllowed, true),
          accessLevels.public
            ? eq(tables.album.visibility, AlbumVisibility.PUBLIC)
            : undefined,
          accessLevels.authenticated
            ? eq(tables.album.visibility, AlbumVisibility.AUTHENTICATED)
            : undefined,
          accessLevels.private
            ? eq(tables.album.visibility, AlbumVisibility.PRIVATE)
            : undefined,
        ),
      ),
    )
    .orderBy(desc(tables.favorite.favoritedAt));
});
