import z from "zod";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse);

  const cover = await useStorage().getItemRaw(coverKey(id));
  if (!cover) {
    throw createError({ statusCode: 404, message: "Cover not found." });
  }

  setImageHeaders(event);
  return toBuffer(cover);
});

const paramSchema = z.object({
  id: z.cuid2(),
});
