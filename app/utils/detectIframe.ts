export const useDetectIframe = () => {
  if (import.meta.client) {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  } else {
    const destination = useRequestHeader("Sec-Fetch-Dest");
    return destination === "iframe" || destination === "frame";
  }
};
