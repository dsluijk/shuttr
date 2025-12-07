import z from "zod";
import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { AlbumVisibility } from "~~/server/database/schema/album";

export default defineEventHandler(async (event) => {
  const accessLevels: Record<AlbumVisibility, boolean> = {
    public: true,
    authenticated: await allows(event, viewAuthenticatedAlbums),
    private: await allows(event, viewPrivateAlbums),
  };

  const { search, labels, limit, offset } = await getValidatedQuery(
    event,
    querySchema.parse,
  );

  const db = useDrizzle();
  return await db
    .select({
      ...getTableColumns(tables.album),
      cover: {
        id: tables.photo.id,
        thumbHash: tables.photo.thumbHash,
        width: tables.photo.width,
        height: tables.photo.height,
      },
      albumLabels: sql<(typeof tables.label.$inferSelect)[]>`
        coalesce(
          json_agg(
            distinct jsonb_build_object(
              'id', ${tables.label.id},
              'title', ${tables.label.title},
              'style', ${tables.label.style}
            )
          ) filter (where ${tables.label.id} is not null),
          '[]'
        )
      `.as("albumLabels"),
    })
    .from(tables.album)
    .leftJoin(tables.photo, eq(tables.photo.id, tables.album.coverPhoto))
    .leftJoin(
      tables.albumLabels,
      eq(tables.albumLabels.albumId, tables.album.id),
    )
    .leftJoin(tables.label, eq(tables.label.id, tables.albumLabels.labelId))
    .where(
      and(
        search && search.length > 0
          ? sql`${tables.album.search} @@ to_tsquery('english', ${search} || ':*')`
          : sql`true`,
        and(...labels.map((label) => eq(tables.label.id, label))),
        or(
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
    .groupBy(tables.album.id, tables.photo.id)
    .orderBy(desc(tables.album.startDate), desc(tables.album.createdAt))
    .limit(limit)
    .offset(offset);
});

const querySchema = z.object({
  limit: z.coerce.number().multipleOf(1).min(1).max(20).default(20),
  offset: z.coerce.number().multipleOf(1).nonnegative().default(0),
  search: z.string().max(60).optional(),
  labels: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.cuid2()).max(4).default([]),
  ),
});
