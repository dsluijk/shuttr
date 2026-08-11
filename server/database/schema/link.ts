import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { cuid2 } from "./utils";

export const link = pgTable("link", {
  id: cuid2().primaryKey(),
  icon: text().notNull(),
  to: text().notNull(),
  label: varchar({ length: 32 }),
  ordering: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
});
