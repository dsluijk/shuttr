import { rgbaToThumbHash } from "thumbhash";

import exifReader from "exifreader";
import sharp from "sharp";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import z from "zod";

import { PhotoType } from "~~/server/database/schema/photo";

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const db = useDrizzle();
  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.slug, slug),
  });

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  const original = await readRawBody(event, false);
  if (!original) {
    throw createError({
      statusCode: 400,
      statusMessage: "No image uploaded",
    });
  }

  if (original.byteLength > 50 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image too large",
    });
  }

  const originalDigest = await createDigest(new Uint8Array(original).buffer);
  const existingPhotos = await db.query.photo.findMany({
    where: (photo, { and, eq }) =>
      and(eq(photo.album, album.id), eq(photo.originalDigest, originalDigest)),
    columns: {
      location: false,
    },
  });
  if (existingPhotos.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image is already in album",
    });
  }

  let tags;
  try {
    tags = exifReader.load(original, {
      includeUnknown: true,
      expanded: true,
    });
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image uploaded",
    });
  }

  const type = readTag(tags.file, "FileType");
  if (type !== "JPEG") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image format",
    });
  }

  const width =
    Number(readTag(tags.file, "Image Width")?.replace("px", "")) || undefined;
  const height =
    Number(readTag(tags.file, "Image Height")?.replace("px", "")) || undefined;

  if (!width || !height) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing image metadata",
    });
  }

  const large = await sharp(original)
    .webp()
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const { data: thumb, info: thumbInfo } = await sharp(large)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "outside", kernel: "linear" })
    .toBuffer({ resolveWithObject: true });

  const [dateTime, offsetTime] = getDate(tags.exif);
  const thumbHash = Buffer.from(
    rgbaToThumbHash(thumbInfo.width, thumbInfo.height, thumb),
  ).toString("base64");

  const result = await db
    .insert(tables.photo)
    .values({
      album: album.id,
      type: PhotoType[type],
      originalDigest,
      thumbHash,
      size: original.byteLength,
      width,
      height,
      dateTime,
      offsetTime,
      cameraMake: readTag(tags.exif, "Make"),
      cameraModel: readTag(tags.exif, "Model"),
      lens: readTag(tags.exif, "LensModel"),
      flash: readTag(tags.exif, "Flash"),
      iso: Number(readTag(tags.exif, "ISOSpeedRatings")) || undefined,
      focalLength: readTag(tags.exif, "FocalLength"),
      fNumber: readTag(tags.exif, "FNumber"),
      exposureTime: readTag(tags.exif, "ExposureTime"),
      software: readTag(tags.exif, "Software"),
      copyright: readTag(tags.exif, "Copyright"),
      location: readLocation(tags.gps),
    })
    .returning();

  if (result.length !== 1 || result[0] === undefined) {
    throw createError({
      statusCode: 500,
      message: "Failed to insert photo metadata",
    });
  }

  const photo = result[0];
  const storage = useStorage();
  await storage.setItemRaw(
    `storage:photo:${album.id}:${photo.id}:large`,
    large,
  );
  await storage.setItemRaw(
    `storage:photo:${album.id}:${photo.id}:original`,
    original,
  );

  return photo;
});

const paramSchema = z.object({
  slug: z.string().min(4),
});

const readTag = <T extends object>(
  tags: T | undefined,
  key: keyof T,
  fallback: string | undefined = undefined,
): string | undefined => {
  if (!tags) {
    return fallback;
  }

  if (!(key in tags)) {
    return fallback;
  }

  return (tags[key] as exifReader.TypedTag<unknown>).description;
};

const parseDate = (
  date: string | undefined,
  tz: string | undefined,
): [Date, string] | undefined => {
  dayjs.extend(customParseFormat);
  dayjs.extend(timezone);
  dayjs.extend(utc);

  if (!date) {
    return undefined;
  }

  if (!tz) {
    // If there is no TZ data available we will guess it.
    tz = dayjs().tz(dayjs.tz.guess()).format("Z");
  }

  return [dayjs.tz(date, "YYYY:MM:DD HH:mm:ss", tz).toDate(), tz];
};

const getDate = (exif: exifReader.ExifTags | undefined): [Date, string] => {
  dayjs.extend(customParseFormat);
  dayjs.extend(timezone);
  dayjs.extend(utc);

  for (const type of ["Original", "Digitized", ""]) {
    const parsed = parseDate(
      readTag(exif, ("DateTime" + type) as keyof exifReader.ExifTags),
      readTag(exif, ("OffsetTime" + type) as keyof exifReader.ExifTags),
    );

    if (parsed) {
      return parsed;
    }
  }

  // Fallback in case the EXIF doesn't contain any dates.
  const tz = dayjs().tz(dayjs.tz.guess()).format("Z");
  return [dayjs().tz(tz).toDate(), tz];
};

const readLocation = (
  gps: exifReader.GpsTags | undefined,
): [number, number] | undefined => {
  if (!gps || !gps.Latitude || !gps.Longitude) {
    return undefined;
  }

  return [gps.Latitude, gps.Longitude];
};
