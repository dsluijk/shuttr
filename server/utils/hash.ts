export const createDigest = async (
  buffer: Uint8Array | ArrayBuffer,
): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    buffer as BufferSource,
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};
