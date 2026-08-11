import { useDrizzle } from "./drizzle";
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
