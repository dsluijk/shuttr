export default defineNuxtPlugin({
  name: "shuttr:settings",
  enforce: "pre",
  async setup(nuxtApp) {
    const settings = useSettings();

    if (import.meta.server || !nuxtApp.payload.serverRendered) {
      try {
        settings.value = await useRequestFetch()("/api/settings");
      } catch (error) {
        console.error(
          "Failed to load the settings, using the defaults.",
          error,
        );
      }
    }

    const applyColors = () =>
      updateAppConfig({
        ui: {
          colors: {
            primary: settings.value.primaryColor,
            neutral: settings.value.neutralColor,
          },
        },
      });

    applyColors();

    if (import.meta.client) {
      watch(settings, applyColors, { deep: true });
    }
  },
});
