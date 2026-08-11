import z from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { mode } = await getValidatedRouterParams(event, paramSchema.parse);

  const previous = (await getSettings())[logoColumn(mode)];
  const settings = await updateSettings(
    mode === "light" ? { logoLight: null } : { logoDark: null },
  );

  if (previous) {
    await useStorage().removeItem(logoKey(previous));
  }

  return settings;
});

const paramSchema = z.object({
  mode: z.literal(["light", "dark"]),
});
