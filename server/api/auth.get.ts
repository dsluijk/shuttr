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
      active:
        !!oauth.authentik.domain
        && !!oauth.authentik.clientId
        && !!oauth.authentik.clientSecret,
    },
    keycloak: {
      displayName: oauth.keycloak.displayName ?? "Keycloak",
      icon: "keycloak",
      active:
        !!oauth.keycloak.serverUrl
        && !!oauth.keycloak.clientId
        && !!oauth.keycloak.clientSecret
        && !!oauth.keycloak.realm,
    },
  };
});
