import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { cuid2, enumToPgEnum } from "./utils";
import { relations } from "drizzle-orm";
import { albumLabels } from "./albumLabels";

export enum LabelStyle {
  SOLID = "solid",
  OUTLINE = "outline",
  SOFT = "soft",
  SUBTLE = "subtle",
}

export const labelStyleColumn = pgEnum("label_style", enumToPgEnum(LabelStyle));

export const label = pgTable("label", {
  id: cuid2().primaryKey(),
  title: varchar({ length: 24 }).unique().notNull(),
  style: labelStyleColumn().default(LabelStyle.SOLID).notNull(),
});

export const labelRelations = relations(label, ({ many }) => ({
  albumLabels: many(albumLabels),
}));
