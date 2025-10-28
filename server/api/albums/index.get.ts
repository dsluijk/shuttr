import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  const accessLevels: Record<AlbumVisibility, boolean> = {
    public: true,
    authenticated: await allows(event, viewAuthenticatedAlbums),
    private: await allows(event, viewPrivateAlbums),
  };

  const db = useDrizzle();
  return await db.query.album.findMany({
    orderBy: (album, { desc }) => [desc(album.createdAt)],
    where: (album, { eq, or }) =>
      or(
        accessLevels.public
          ? eq(album.visibility, AlbumVisibility.PUBLIC)
          : undefined,
        accessLevels.authenticated
          ? eq(album.visibility, AlbumVisibility.AUTHENTICATED)
          : undefined,
        accessLevels.private
          ? eq(album.visibility, AlbumVisibility.PRIVATE)
          : undefined
      ),
  });
});
