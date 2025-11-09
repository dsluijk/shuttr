import type { User } from "#auth-utils";
import { allow, defineAbility, deny } from "#imports";
import { UserRole } from "~~/server/database/schema/user";

const atLeastRole = (minimum: UserRole, userRole: UserRole | null) => {
  if (minimum === UserRole.GUEST && userRole) return true;
  if (
    minimum === UserRole.PUBLISHER
    && (userRole === UserRole.PUBLISHER || userRole === UserRole.ADMIN)
  )
    return true;
  if (minimum === UserRole.ADMIN && userRole === UserRole.ADMIN) return true;

  return false;
};

export const listUsers = defineAbility((user: User) => {
  if (atLeastRole(UserRole.ADMIN, user.role)) {
    return allow();
  }

  return deny();
});

export const createAlbum = defineAbility((user: User) => {
  if (atLeastRole(UserRole.PUBLISHER, user.role)) {
    return allow();
  }

  return deny();
});

export const uploadPhotos = defineAbility((user: User) => {
  if (atLeastRole(UserRole.PUBLISHER, user.role)) {
    return allow();
  }

  return deny();
});

export const viewAuthenticatedAlbums = defineAbility(() => {
  // This blocks unauthenticated users.
  return allow();
});

export const viewPrivateAlbums = defineAbility((user: User) => {
  if (atLeastRole(UserRole.PUBLISHER, user.role)) {
    return allow();
  }

  return deny();
});
