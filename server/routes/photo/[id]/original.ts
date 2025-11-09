import z from "zod";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse);
  const storage = useStorage();

  return await storage.getItemRaw(`photo:original:${id}`);
});

const paramSchema = z.object({
  id: z.cuid2(),
});
