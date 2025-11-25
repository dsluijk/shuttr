import { foreignKey, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { album } from "./album";
import { label } from "./label";
import { cuid2 } from "./utils";
import { relations } from "drizzle-orm";

export const albumLabels = pgTable(
  "albumLabels",
  {
    albumId: cuid2()
      .notNull()
      .references(() => album.id),
    labelId: cuid2()
      .notNull()
      .references(() => label.id),
  },
  (t) => [
    primaryKey({ columns: [t.albumId, t.labelId] }),
    foreignKey({
      columns: [t.albumId],
      foreignColumns: [album.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [t.labelId],
      foreignColumns: [label.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const albumLabelsRelations = relations(albumLabels, ({ one }) => ({
  album: one(album, {
    fields: [albumLabels.albumId],
    references: [album.id],
  }),
  label: one(label, {
    fields: [albumLabels.labelId],
    references: [label.id],
  }),
}));
