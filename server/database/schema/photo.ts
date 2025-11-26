import {
  foreignKey,
  geometry,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { cuid2, enumToPgEnum } from "./utils";
import { album } from "./album";
import { relations } from "drizzle-orm";

export enum PhotoType {
  jpeg = "jpeg",
}

export const photoTypeColumn = pgEnum("photo_type", enumToPgEnum(PhotoType));

export const photo = pgTable(
  "photo",
  {
    id: cuid2().primaryKey(),
    album: cuid2().notNull(),
    type: photoTypeColumn().notNull(),
    fileName: text().notNull(),
    originalDigest: text().notNull(),
    thumbHash: text().notNull(),
    size: integer().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    dateTime: timestamp().notNull(),
    offsetTime: text().notNull(),
    uploadedAt: timestamp().notNull().defaultNow(),
    // Start optional values taken from EXIF.
    cameraMake: text(),
    cameraModel: text(),
    lens: text(),
    flash: text(),
    iso: integer(),
    focalLength: text(),
    fNumber: text(),
    exposureTime: text(),
    software: text(),
    copyright: text(),
    location: geometry({ type: "point", mode: "tuple", srid: 4326 }),
  },
  (t) => [
    foreignKey({
      columns: [t.album],
      foreignColumns: [album.id],
    })
      .onUpdate("cascade")
      // They will need to be deleted explicitly as we also need to delete them from storage.
      .onDelete("restrict"),
    index().on(t.album),
    index().on(t.dateTime),
    unique().on(t.album, t.originalDigest),
  ],
);

export const photoRelations = relations(photo, ({ one }) => ({
  album: one(album, { fields: [photo.album], references: [album.id] }),
}));
