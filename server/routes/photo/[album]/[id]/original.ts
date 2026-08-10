import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { album, id } = await getValidatedRouterParams(
    event,
    paramSchema.parse,
  );
  const timings = useTimings(event);

  const photo = await resolvePhoto(event, album, id, "original");
  const metadata = await timings.time("decode", () => sharp(photo).metadata());
  setPhotoHeaders(event, `image/${metadata.format}`);
  return photo;
});

const paramSchema = z.object({
  album: z.cuid2(),
  id: z.cuid2(),
});
