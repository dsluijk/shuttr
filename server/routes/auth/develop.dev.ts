import { ProviderEnum } from "~~/server/database/schema/userProvider";
import { UserRole } from "~~/server/database/schema/user";

const rolesMap: Record<string, UserRole> = {
  "guest@example.com": UserRole.GUEST,
  "publisher@example.com": UserRole.PUBLISHER,
  "admin@example.com": UserRole.ADMIN,
} as const;

// A Dex instance is used to provide a local oidc provider.
// This should just work instantly, and is automatically disabled when building for release.
export default defineOAuthDevelopEventHandler({
  async onSuccess(event, { user: oauthUser }) {
    const defaultRole = rolesMap[oauthUser.email] ?? UserRole.GUEST;
    await handleOAuthCallback(
      event,
      ProviderEnum.DEVELOP,
      oauthUser,
      defaultRole
    );

    return sendRedirect(event, "/");
  },
});
