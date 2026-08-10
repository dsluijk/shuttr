import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const timings = useTimings(event);
  const storage = useStorage();

  const photo = await timings.time("fetch", () =>
    storage.getItemRaw(`storage:photo:${album}:${id}:large`),
  );
  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found." });
  }

  setResponseHeader(event, "Content-Type", "image/webp");
  return Buffer.from(photo, "base64");
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
