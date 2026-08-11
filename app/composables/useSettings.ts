import { useState } from "#imports";
import { defaultSettings } from "~~/shared/utils/theme";

import type { Settings } from "~~/server/utils/settings";

export const useSettings = () =>
  useState<Settings>("settings", () => ({
    id: true,
    ...defaultSettings,
    links: [],
  }));
