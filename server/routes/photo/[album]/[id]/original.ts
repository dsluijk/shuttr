import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const storage = useStorage();

  const photo = await storage.getItemRaw(
    `storage:photo:${album}:${id}:original`,
  );
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  return Buffer.from(photo, "base64");
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
