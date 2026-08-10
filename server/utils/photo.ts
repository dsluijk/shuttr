import type { H3Event } from "h3";

import { rgbaToThumbHash } from "thumbhash";
import sharp, { type SharpInput } from "sharp";

const CACHE_CONTROL = "private, max-age=31536000, immutable";

export type PhotoVariant = "original" | "large" | "thumb";

interface VariantSpec {
  source?: PhotoVariant;
  derive?: (input: SharpInput) => Promise<Buffer>;
  cache: boolean;
}

export const setPhotoHeaders = (event: H3Event, contentType: string) => {
  setResponseHeader(event, "Content-Type", contentType);
  setResponseHeader(event, "Cache-Control", CACHE_CONTROL);
};

export const toBuffer = (value: ArrayBuffer | Buffer | Uint8Array): Buffer => {
  return Buffer.isBuffer(value) ? value : Buffer.from(value as ArrayBuffer);
};

export const createLarge = (input: SharpInput): Promise<Buffer> => {
  return sharp(input)
    .webp()
    .autoOrient()
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .toBuffer();
};

export const createThumbnail = (input: SharpInput): Promise<Buffer> => {
  return sharp(input)
    .webp({ effort: 2 })
    .autoOrient()
    .ensureAlpha()
    .resize(400, 400, { fit: "outside" })
    .toBuffer();
};

const VARIANTS: Record<PhotoVariant, VariantSpec> = {
  original: { cache: false },
  large: { source: "original", derive: createLarge, cache: false },
  thumb: { source: "large", derive: createThumbnail, cache: true },
};

export const storedKey = (
  album: string,
  photo: string,
  variant: PhotoVariant,
) => {
  return `storage:photo:${album}:${photo}:${variant}`;
};

export const cacheKey = (
  album: string,
  photo: string,
  variant: PhotoVariant,
) => {
  return `temp:photo:${album}:${photo}:${variant}`;
};

const storeVariant = async (
  album: string,
  photo: string,
  variant: PhotoVariant,
  data: Buffer,
): Promise<void> => {
  const storage = useStorage();

  await Promise.all([
    storage.setItemRaw(storedKey(album, photo, variant), data),
    VARIANTS[variant].cache
      ? storage.setItemRaw(cacheKey(album, photo, variant), data)
      : Promise.resolve(),
  ]);
};

export const resolvePhoto = async (
  event: H3Event,
  album: string,
  photo: string,
  variant: PhotoVariant,
): Promise<Buffer> => {
  const timings = useTimings(event);
  const storage = useStorage();
  const { source, derive, cache } = VARIANTS[variant];

  if (cache) {
    const cached = await timings.time(`${variant}-cache`, () =>
      storage.getItemRaw(cacheKey(album, photo, variant)),
    );
    if (cached) {
      return toBuffer(cached);
    }
  }

  const stored = await timings.time(`${variant}-fetch`, () =>
    storage.getItemRaw(storedKey(album, photo, variant)),
  );
  if (stored) {
    const data = toBuffer(stored);
    if (cache) {
      await storage.setItemRaw(cacheKey(album, photo, variant), data);
    }

    return data;
  }

  if (!source || !derive) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  const input = await resolvePhoto(event, album, photo, source);
  const data = await timings.time(`${variant}-encode`, () => derive(input));
  await timings.time(`${variant}-store`, () =>
    storeVariant(album, photo, variant, data),
  );

  return data;
};

export const createThumbHash = async (input: SharpInput): Promise<string> => {
  const { data, info } = await sharp(input)
    .raw()
    .autoOrient()
    .ensureAlpha()
    .resize(32, 32, { fit: "outside", kernel: "linear" })
    .toBuffer({ resolveWithObject: true });

  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString(
    "base64",
  );
};

export const storeDerivatives = async (
  album: string,
  photo: string,
  original: Buffer,
): Promise<void> => {
  const buffers = new Map<PhotoVariant, Buffer>([["original", original]]);

  for (const [variant, { source, derive }] of Object.entries(VARIANTS) as [
    PhotoVariant,
    VariantSpec,
  ][]) {
    if (!source || !derive) {
      continue;
    }

    const input = buffers.get(source);
    if (!input) {
      throw new Error(`Cannot derive ${variant} without ${source}.`);
    }

    const data = await derive(input);
    buffers.set(variant, data);
    await storeVariant(album, photo, variant, data);
  }
};
