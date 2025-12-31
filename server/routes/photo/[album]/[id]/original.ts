import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const storage = useStorage();

  const photoEncoded = await storage.getItemRaw(
    `storage:photo:${album}:${id}:original`,
  );
  if (!photoEncoded) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  const photo = Buffer.from(photoEncoded, "base64");
  const metadata = await sharp(photo).metadata();
  setResponseHeader(event, "Content-Type", `image/${metadata.format}`);
  return photo;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
