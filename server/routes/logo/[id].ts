import z from "zod";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse);

  const logo = await useStorage().getItemRaw(logoKey(id));
  if (!logo) {
    throw createError({ statusCode: 404, message: "Logo not found." });
  }

  setLogoHeaders(event);
  return toBuffer(logo);
});

const paramSchema = z.object({
  id: z.cuid2(),
});
