import { ProviderEnum } from "~~/server/database/schema/userProvider";
import { UserRole } from "~~/server/database/schema/user";

export default defineEventHandler(async (event) => {
  const { oauth } = useRuntimeConfig(event);

  if (
    !(
      oauth.authentik.domain
      && oauth.authentik.clientId
      && oauth.authentik.clientSecret
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Authentication method not available.",
    });
  }

  return defineOAuthAuthentikEventHandler({
    async onSuccess(event, { user: oauthUser }) {
      let role = UserRole.GUEST;

      if (
        oauth.authentik.groups.publisher !== ""
        && oauthUser.groups.includes(oauth.authentik.groups.publisher)
      ) {
        role = UserRole.PUBLISHER;
      }

      if (
        oauth.authentik.groups.admin !== ""
        && oauthUser.groups.includes(oauth.authentik.groups.admin)
      ) {
        role = UserRole.ADMIN;
      }

      await handleOAuthCallback(event, ProviderEnum.AUTHENTIK, oauthUser, role);
      return sendRedirect(event, "/");
    },
  })(event);
});
