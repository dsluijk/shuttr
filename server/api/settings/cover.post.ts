import { createId } from "@paralleldrive/cuid2";

export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const data = await readImageUpload(event, COVER_MAX_SIZE);

  const cover = await createCover(data);
  const id = createId();
  const storage = useStorage();
  await storage.setItemRaw(coverKey(id), cover);

  const { cover: previous } = await getSettings();
  const settings = await updateSettings({ cover: id });

  if (previous) {
    await storage.removeItem(coverKey(previous));
  }

  return settings;
});
