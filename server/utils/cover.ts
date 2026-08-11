import sharp, { type SharpInput } from "sharp";

export const COVER_MAX_SIZE = 50 * 1024 * 1024;

export const coverKey = (id: string) => `storage:cover:${id}`;

export const createCover = (input: SharpInput): Promise<Buffer> => {
  return sharp(input)
    .webp()
    .autoOrient()
    .resize(2400, 1600, { fit: "inside", withoutEnlargement: true })
    .toBuffer();
};
