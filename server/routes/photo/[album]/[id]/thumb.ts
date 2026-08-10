import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const timings = useTimings(event);
  const storage = useStorage();

  let thumb = await timings.time("cache", () =>
    storage.getItemRaw(`temp:photo:${album}:${id}:thumb`),
  );
  if (thumb) {
    setResponseHeader(event, "Content-Type", "image/webp");
    return thumb;
  }

  const photo = await timings.time("fetch", () =>
    storage.getItemRaw(`storage:photo:${album}:${id}:large`),
  );
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  thumb = await timings.time("encode", () =>
    sharp(photo)
      .webp({ effort: 2 })
      .ensureAlpha()
      .resize(400, 400, { fit: "outside" })
      .toBuffer(),
  );

  setResponseHeader(event, "Content-Type", "image/webp");
  await timings.time("cache-write", () =>
    storage.setItemRaw(`temp:photo:${album}:${id}:thumb`, thumb),
  );
  return thumb;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
