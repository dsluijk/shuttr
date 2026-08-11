import { boolean, char, check, pgTable, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import type { NeutralColor, PrimaryColor } from "~~/shared/utils/theme";

export const setting = pgTable(
  "setting",
  {
    id: boolean().primaryKey().default(true).notNull(),
    title: varchar({ length: 32 }).notNull(),
    header: varchar({ length: 64 }).notNull(),
    description: varchar({ length: 512 }).notNull(),
    primaryColor: varchar({ length: 16 }).$type<PrimaryColor>().notNull(),
    neutralColor: varchar({ length: 16 }).$type<NeutralColor>().notNull(),
    logoLight: char({ length: 24 }),
    logoDark: char({ length: 24 }),
  },
  (t) => [check("setting_singleton", sql`${t.id}`)],
);
