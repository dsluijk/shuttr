import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse
  );
  const storage = useStorage();

  let thumb = await storage.getItemRaw(`photo:thumb:${album}:${id}`);
  if (thumb) {
    return thumb;
  }

  const original = await storage.getItemRaw(`photo:original:${album}:${id}`);
  if (!original) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  thumb = await sharp(original)
    .webp()
    .ensureAlpha()
    .resize(400, 400, { fit: "outside" })
    .toBuffer();

  await storage.setItemRaw(`photo:thumb:${album}:${id}`, thumb);
  return thumb;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
