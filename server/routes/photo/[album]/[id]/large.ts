import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );

  const large = await resolvePhoto(event, album, id, "large");

  setPhotoHeaders(event, "image/webp");
  return large;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
