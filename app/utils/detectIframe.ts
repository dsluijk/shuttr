import { useRequestHeader } from "#imports";

export const useDetectIframe = () => {
  if (import.meta.client) {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  } else {
    const destination = useRequestHeader("Sec-Fetch-Dest");
    return destination === "iframe" || destination === "frame";
  }
};
