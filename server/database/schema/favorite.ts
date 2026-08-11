import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { photo } from "./photo";
import { cuid2 } from "./utils";
import { relations } from "drizzle-orm";

export const favorite = pgTable(
  "favorite",
  {
    userId: cuid2()
      .notNull()
      .references(() => user.id),
    photoId: cuid2()
      .notNull()
      .references(() => photo.id),
    favoritedAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.photoId] }),
    foreignKey({
      columns: [t.userId],
      foreignColumns: [user.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [t.photoId],
      foreignColumns: [photo.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index().on(t.userId, t.favoritedAt),
  ],
);

export const favoriteRelations = relations(favorite, ({ one }) => ({
  user: one(user, {
    fields: [favorite.userId],
    references: [user.id],
  }),
  photo: one(photo, {
    fields: [favorite.photoId],
    references: [photo.id],
  }),
}));
