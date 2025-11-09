import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const storage = useStorage();

  let thumb = await storage.getItemRaw(`photo:thumb:${id}`);
  if (thumb) {
    return thumb;
  }

  const original = await storage.getItemRaw(`photo:original:${id}`);
  thumb = await sharp(original)
    .webp()
    .ensureAlpha()
    .resize(400, 400, { fit: "outside" })
    .toBuffer();

  await storage.setItemRaw(`photo:thumb:${id}`, thumb);
  return thumb;
});

const paramSchema = z.object({
  id: z.cuid2(),
});
