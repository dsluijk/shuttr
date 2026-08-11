import { createId } from "@paralleldrive/cuid2";
import sharp from "sharp";
import z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { mode } = await getValidatedRouterParams(event, paramSchema.parse);

  const contentLength = Number(getRequestHeader(event, "content-length"));
  if (contentLength > LOGO_MAX_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: "Logo too large",
    });
  }

  const data = await readRawBody(event, false);
  if (!data || data.byteLength === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded.",
    });
  }

  if (data.byteLength > LOGO_MAX_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: "Logo too large",
    });
  }

  const { format } = await sharp(data).metadata();
  if (!format || !LOGO_FORMATS.includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image format",
    });
  }

  const logo = await createLogo(data);
  const id = createId();
  const storage = useStorage();
  await storage.setItemRaw(logoKey(id), logo);

  const previous = (await getSettings())[logoColumn(mode)];
  const settings = await updateSettings(
    mode === "light" ? { logoLight: id } : { logoDark: id },
  );

  if (previous) {
    await storage.removeItem(logoKey(previous));
  }

  return settings;
});

const paramSchema = z.object({
  mode: z.literal(["light", "dark"]),
});
