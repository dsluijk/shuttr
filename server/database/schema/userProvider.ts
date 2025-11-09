import {
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { cuid2, enumToPgEnum } from "./utils";
import { user } from "./user";
import { relations } from "drizzle-orm";

export enum ProviderEnum {
  DEVELOP = "develop",
  AUTHENTIK = "authentik",
  KEYCLOAK = "keycloak",
}

export const provider = pgEnum("provider", enumToPgEnum(ProviderEnum));

export const userProvider = pgTable(
  "user_provider",
  {
    id: cuid2().primaryKey(),
    userId: cuid2().notNull(),
    provider: provider().notNull(),
    providerUserId: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    lastSeen: timestamp().notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      columns: [t.userId],
      foreignColumns: [user.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    index().on(t.providerUserId),
    unique().on(t.userId, t.provider),
    unique().on(t.provider, t.providerUserId),
  ],
);

export const userProviderRelations = relations(userProvider, ({ one }) => ({
  user: one(user, { fields: [userProvider.userId], references: [user.id] }),
}));
