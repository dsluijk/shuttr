import type { H3Event } from "h3";

import sharp from "sharp";

const CACHE_CONTROL = "public, max-age=31536000, immutable";
const IMAGE_FORMATS = ["png", "jpeg", "webp"];

export const setImageHeaders = (event: H3Event) => {
  setResponseHeader(event, "Content-Type", "image/webp");
  setResponseHeader(event, "Cache-Control", CACHE_CONTROL);
};

export const readImageUpload = async (
  event: H3Event,
  maxSize: number,
): Promise<Buffer> => {
  const contentLength = Number(getRequestHeader(event, "content-length"));
  if (contentLength > maxSize) {
    throw createError({
      statusCode: 413,
      statusMessage: "Image too large",
    });
  }

  const data = await readRawBody(event, false);
  if (!data || data.byteLength === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded.",
    });
  }

  if (data.byteLength > maxSize) {
    throw createError({
      statusCode: 413,
      statusMessage: "Image too large",
    });
  }

  const { format } = await sharp(data).metadata();
  if (!format || !IMAGE_FORMATS.includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image format",
    });
  }

  return data;
};
