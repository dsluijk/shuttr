import { createError } from "h3";

import { tables, useDrizzle } from "./drizzle";
import { defaultSettings } from "~~/shared/utils/theme";

import type { link, setting } from "../database/schema";

/** The link columns exposed through the settings, kept in sync with the type. */
const linkColumns = {
  id: true,
  icon: true,
  to: true,
  label: true,
  ordering: true,
} as const;

export type SettingsLink = Pick<
  typeof link.$inferSelect,
  keyof typeof linkColumns
>;

export type Settings = typeof setting.$inferSelect & {
  links: SettingsLink[];
};

let cache: Settings | null = null;

export const getSettings = async (): Promise<Settings> => {
  if (cache) return cache;

  const db = useDrizzle();
  const [row, links] = await Promise.all([
    db.query.setting.findFirst(),
    db.query.link.findMany({
      columns: linkColumns,
      orderBy: (link, { asc }) => [asc(link.ordering), asc(link.createdAt)],
    }),
  ]);

  const settings = { ...(row ?? { id: true, ...defaultSettings }), links };

  cache = settings;
  return settings;
};

export const invalidateSettings = () => {
  cache = null;
};

export const updateSettings = async (
  values: Partial<Omit<Settings, "id" | "links">>,
): Promise<Settings> => {
  const { links: _links, id: _id, ...current } = await getSettings();
  const merged = { ...current, ...values };

  const db = useDrizzle();
  const result = await db
    .insert(tables.setting)
    .values({ id: true, ...merged })
    .onConflictDoUpdate({ target: tables.setting.id, set: merged })
    .returning();

  if (result.length !== 1 || !result[0]) {
    throw createError({
      statusCode: 500,
      message: "Failed to update the settings",
    });
  }

  invalidateSettings();
  return await getSettings();
};
