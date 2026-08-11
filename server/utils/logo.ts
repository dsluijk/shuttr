import sharp, { type SharpInput } from "sharp";

export const LOGO_MAX_SIZE = 5 * 1024 * 1024;

export type LogoMode = "light" | "dark";

export const logoColumn = (mode: LogoMode) =>
  mode === "light" ? "logoLight" : "logoDark";

export const logoKey = (id: string) => `storage:logo:${id}`;

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
