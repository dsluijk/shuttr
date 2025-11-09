import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse
  );
  const storage = useStorage();

  const photo = await storage.getItemRaw(`photo:original:${album}:${id}`);
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  return photo;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
