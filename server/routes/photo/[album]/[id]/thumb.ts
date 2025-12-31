import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const storage = useStorage();

  let thumb = await storage.getItemRaw(`temp:photo:${album}:${id}:thumb`);
  if (thumb) {
    setResponseHeader(event, "Content-Type", "image/webp");
    return thumb;
  }

  const photo = await storage.getItemRaw(`storage:photo:${album}:${id}:large`);
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  thumb = await sharp(photo)
    .webp()
    .ensureAlpha()
    .resize(400, 400, { fit: "outside" })
    .toBuffer();

  setResponseHeader(event, "Content-Type", "image/webp");
  await storage.setItemRaw(`temp:photo:${album}:${id}:thumb`, thumb);
  return thumb;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
