import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );

  const thumb = await resolvePhoto(event, album, id, "thumb");

  setPhotoHeaders(event, "image/webp");
  return thumb;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
