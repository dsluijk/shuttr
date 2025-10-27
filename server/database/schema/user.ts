import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { cuid2, enumToPgEnum } from "./utils";
import { relations } from "drizzle-orm";
import { userProvider } from "./userProvider";

export enum UserRole {
  GUEST = "guest",
  PUBLISHER = "publisher",
  ADMIN = "admin",
}

export const userRoleColumn = pgEnum("user_role", enumToPgEnum(UserRole));

export const user = pgTable("user", {
  id: cuid2().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  email: varchar({ length: 256 }).notNull().unique(),
  role: userRoleColumn().default(UserRole.GUEST).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  providers: many(userProvider),
}));
