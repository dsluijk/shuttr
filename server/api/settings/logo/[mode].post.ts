import { createId } from "@paralleldrive/cuid2";
import z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { mode } = await getValidatedRouterParams(event, paramSchema.parse);
  const data = await readImageUpload(event, LOGO_MAX_SIZE);

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
