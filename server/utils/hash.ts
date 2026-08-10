import { hash } from "node:crypto";

export const createDigest = (buffer: Uint8Array | ArrayBuffer): string => {
  return hash(
    "sha256",
    ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer),
    "hex",
  );
};
