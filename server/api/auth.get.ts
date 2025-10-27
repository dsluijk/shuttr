export default defineEventHandler(async (event) => {
  const { oauth } = useRuntimeConfig(event);

  return {
    develop: {
      displayName: "Develop",
      icon: "openid",
      active: Boolean(import.meta.dev),
    },
    authentik: {
      displayName: oauth.authentik.displayName ?? "Authentik",
      icon: "authentik",
      active: Boolean(
        oauth.authentik.domain &&
          oauth.authentik.clientId &&
          oauth.authentik.clientSecret
      ),
    },
  };
});
