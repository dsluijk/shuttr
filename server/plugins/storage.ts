import fsDriver from "unstorage/drivers/fs";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const storage = useStorage();

  if (config.storage.type !== "file") {
    throw createError("Unsupported storage type");
  }

  const originalPhotoDriver = fsDriver({
    base: `${config.storage.file.base}/photo/original`,
  });

  storage.mount("photo:original", originalPhotoDriver);
});
