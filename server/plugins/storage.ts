import fsDriver from "unstorage/drivers/fs";
import s3Driver from "unstorage/drivers/s3";
import lruCacheDriver from "unstorage/drivers/lru-cache";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const storage = useStorage();

  let storageDriver;
  if (config.storage.type === "file") {
    storageDriver = fsDriver({
      base: config.storage.file.base,
    });
  } else if (config.storage.type === "s3") {
    if (
      !config.storage.s3.accessKey
      || !config.storage.s3.secretKey
      || !config.storage.s3.endpoint
    ) {
      throw createError("Incomplete S3 configuration");
    }

    storageDriver = s3Driver({
      accessKeyId: config.storage.s3.accessKey,
      secretAccessKey: config.storage.s3.secretKey,
      endpoint: config.storage.s3.endpoint,
      bucket: config.storage.s3.bucket,
      region: config.storage.s3.region,
    });
  } else {
    throw createError("Unsupported storage type");
  }

  const tempDriver = lruCacheDriver({
    max: Number(config.storage.thumb.cacheMax) || 1000,
  });

  storage.mount("storage", storageDriver);
  storage.mount("temp", tempDriver);
});
