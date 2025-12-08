import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { cuid2, enumToPgEnum, tsvector } from "./utils";
import { relations, sql, type SQL } from "drizzle-orm";
import { photo } from "./photo";
import { albumLabels } from "./albumLabels";

export enum AlbumVisibility {
  // Anyone can see the album on the homepage.
  PUBLIC = "public",
  // Only authenticated people can see the album.
  AUTHENTICATED = "authenticated",
  // Only publishers and administrators can see the album.
  PRIVATE = "private",
}

export const albumVisibilityColumn = pgEnum(
  "album_visibility",
  enumToPgEnum(AlbumVisibility),
);

export const album = pgTable(
  "album",
  {
    id: cuid2().primaryKey(),
    // Slug used to access the album, usually generated from the title.
    slug: varchar({ length: 128 }).notNull().unique(),
    title: varchar({ length: 64 }).notNull(),
    description: varchar({ length: 512 }).notNull(),
    search: tsvector()
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`setweight(to_tsvector('english', ${album.title}), 'A') || setweight(to_tsvector('english', ${album.description}), 'B')`,
      ),
    coverPhoto: cuid2(),
    startDate: date({ mode: "date" }).notNull(),
    endDate: date({ mode: "date" }).notNull(),
    published: boolean().notNull().default(false),
    // Control the visibility of the album on the main page.
    visibility: albumVisibilityColumn().notNull(),
    // Whenether it's allowed to share the URL of the album.
    // This allows anyone with the link to view the album.
    sharingAllowed: boolean().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index().on(t.slug), index().using("gin", t.search)],
);

export const albumRelations = relations(album, ({ many, one }) => ({
  photos: many(photo),
  albumLabels: many(albumLabels),
  cover: one(photo, { fields: [album.coverPhoto], references: [photo.id] }),
}));
