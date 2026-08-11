export default defineEventHandler(async (event) => {
  await authorize(event, editSettings);

  const { cover: previousCover } = await getSettings();
  const settings = await updateSettings({ cover: null });

  if (previousCover) {
    await useStorage().removeItem(coverKey(previousCover));
  }

  return settings;
});
