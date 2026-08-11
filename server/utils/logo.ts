import type { H3Event } from "h3";

import sharp, { type SharpInput } from "sharp";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

export const LOGO_MAX_SIZE = 5 * 1024 * 1024;
export const LOGO_FORMATS = ["png", "jpeg", "webp"];

export type LogoMode = "light" | "dark";

export const logoColumn = (mode: LogoMode) =>
  mode === "light" ? "logoLight" : "logoDark";

export const logoKey = (id: string) => `storage:logo:${id}`;

export const setLogoHeaders = (event: H3Event) => {
  setResponseHeader(event, "Content-Type", "image/webp");
  setResponseHeader(event, "Cache-Control", CACHE_CONTROL);
};

export const createLogo = (input: SharpInput): Promise<Buffer> => {
  return sharp(input)
    .webp()
    .autoOrient()
    .trim({
      background: "#00000000",
      lineArt: true,
    })
    .resize(600, 120, { fit: "inside", withoutEnlargement: true })
    .toBuffer();
};
