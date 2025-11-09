import z from "zod";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const storage = useStorage();

  const photo = await storage.getItemRaw(`photo:original:${id}`);
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  return photo;
});

const paramSchema = z.object({
  id: z.cuid2(),
});
