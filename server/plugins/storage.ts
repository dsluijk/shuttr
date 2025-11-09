import fsDriver from "unstorage/drivers/fs";
import lruCacheDriver from "unstorage/drivers/lru-cache";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const storage = useStorage();

  if (config.storage.type !== "file") {
    throw createError("Unsupported storage type");
  }

  const originalPhotoDriver = fsDriver({
    base: `${config.storage.file.base}/photo/original`,
  });

  const thumbPhotoDriver = lruCacheDriver({
    max: Number(config.storage.thumb.cacheMax) || 1000,
  });

  storage.mount("photo:original", originalPhotoDriver);
  storage.mount("photo:thumb", thumbPhotoDriver);
});
