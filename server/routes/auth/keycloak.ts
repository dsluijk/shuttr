import { ProviderEnum } from "~~/server/database/schema/userProvider";
import { UserRole } from "~~/server/database/schema/user";

export default defineEventHandler(async (event) => {
  const { oauth } = useRuntimeConfig(event);

  if (
    !(
      oauth.keycloak.serverUrl
      && oauth.keycloak.clientId
      && oauth.keycloak.clientSecret
      && oauth.keycloak.realm
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Authentication method not available.",
    });
  }

  return defineOAuthKeycloakEventHandler({
    async onSuccess(event, { user: oauthUser }) {
      let role = UserRole.GUEST;

      if (
        oauth.keycloak.groups.publisher !== ""
        && oauthUser.groups.includes(oauth.keycloak.groups.publisher)
      ) {
        role = UserRole.PUBLISHER;
      }

      if (
        oauth.keycloak.groups.admin !== ""
        && oauthUser.groups.includes(oauth.keycloak.groups.admin)
      ) {
        role = UserRole.ADMIN;
      }

      await handleOAuthCallback(event, ProviderEnum.KEYCLOAK, oauthUser, role);
      return sendRedirect(event, "/");
    },
  })(event);
});
