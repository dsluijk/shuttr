import exifReader from "exifreader";
import sharp from "sharp";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import z from "zod";

import { PhotoType } from "~~/server/database/schema/photo";

const MAX_SIZE = 50 * 1024 * 1024;

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const EXIF_DATE_FORMAT = "YYYY:MM:DD HH:mm:ss";
const EXIF_OFFSET_FORMAT = /^([+-])(\d{2}):(\d{2})$/;

export default defineEventHandler(async (event) => {
  await authorize(event, editAlbums);

  const { slug } = await getValidatedRouterParams(event, paramSchema.parse);
  const { filename } = await getValidatedQuery(event, querySchema.parse);
  const timings = useTimings(event);
  const db = useDrizzle();

  const album = await timings.time("db-lookup", () =>
    db.query.album.findFirst({
      where: (album, { eq }) => eq(album.slug, slug),
    }),
  );

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: "Album not found",
    });
  }

  const contentLength = Number(getRequestHeader(event, "content-length"));
  if (contentLength > MAX_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: "Image too large",
    });
  }

  const data = await timings.time("read", () => readRawBody(event, false));
  if (!data || data.byteLength === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded.",
    });
  }

  const originalDigest = await timings.time("hash", () => createDigest(data));
  const existingPhotos = await timings.time("db-lookup", () =>
    db.query.photo.findMany({
      where: (photo, { and, eq }) =>
        and(
          eq(photo.album, album.id),
          eq(photo.originalDigest, originalDigest),
        ),
      columns: {
        location: false,
      },
    }),
  );
  if (existingPhotos.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image is already in album",
    });
  }

  const metadata = await timings.time("decode", () => sharp(data).metadata());
  const { width, height } = metadata.autoOrient;
  const { format } = metadata;
  const size = metadata.size ?? data.byteLength;

  if (size > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image too large",
    });
  }

  if (format !== "jpeg") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image format",
    });
  }

  let tags;
  try {
    tags = await timings.time("exif", () =>
      exifReader.load(data, {
        includeUnknown: true,
        expanded: true,
      }),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image uploaded",
    });
  }

  const thumbHash = await timings.time("thumbhash", () =>
    createThumbHash(data),
  );
  const [dateTime, offsetTime] = getDate(tags.exif);

  const result = await timings.time("db-insert", () =>
    db
      .insert(tables.photo)
      .values({
        album: album.id,
        type: PhotoType[format],
        fileName: filename,
        originalDigest,
        thumbHash,
        size,
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
      .returning(),
  );

  if (result.length !== 1 || result[0] === undefined) {
    throw createError({
      statusCode: 500,
      message: "Failed to insert photo metadata",
    });
  }

  const photo = result[0];
  const storage = useStorage();
  await timings.time("store", () =>
    storage.setItemRaw(storedKey(album.id, photo.id, "original"), data),
  );

  event.waitUntil(
    storeDerivatives(album.id, photo.id, data).catch((e) => {
      console.error(`Failed to derive photo ${photo.id}!`);
      console.error(e);
    }),
  );

  return photo;
});

const paramSchema = z.object({
  slug: z.string().min(4),
});

const querySchema = z.object({
  filename: z.string().min(1).max(100),
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
  offset: string | undefined,
): [Date, string] | undefined => {
  if (!date) {
    return undefined;
  }

  const local = dayjs.utc(date.trim(), EXIF_DATE_FORMAT, true);
  if (!local.isValid()) {
    return undefined;
  }

  const match = EXIF_OFFSET_FORMAT.exec(offset?.trim() ?? "");
  if (!match) {
    const guessed = dayjs.tz(date.trim(), EXIF_DATE_FORMAT, dayjs.tz.guess());
    return [guessed.toDate(), guessed.format("Z")];
  }

  const [, sign, hours, minutes] = match;
  const total =
    (Number(hours) * 60 + Number(minutes)) * (sign === "-" ? -1 : 1);

  return [
    local.subtract(total, "minute").toDate(),
    `${total < 0 ? "-" : "+"}${hours}:${minutes}`,
  ];
};

const getDate = (exif: exifReader.ExifTags | undefined): [Date, string] => {
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
  const now = dayjs();
  return [now.toDate(), now.format("Z")];
};

const readLocation = (
  gps: exifReader.GpsTags | undefined,
): [number, number] | undefined => {
  if (!gps || !gps.Latitude || !gps.Longitude) {
    return undefined;
  }

  return [gps.Latitude, gps.Longitude];
};
