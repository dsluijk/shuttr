import type { User } from "#auth-utils";
import { allow, defineAbility, deny } from "#imports";
import { UserRole } from "~~/server/database/schema/user";
import {
  type album as albumSchema,
  AlbumVisibility,
} from "~~/server/database/schema/album";

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

export const editAlbums = defineAbility((user: User) => {
  if (atLeastRole(UserRole.PUBLISHER, user.role)) {
    return allow();
  }

  return deny();
});

export const editLabels = defineAbility((user: User) => {
  if (atLeastRole(UserRole.PUBLISHER, user.role)) {
    return allow();
  }

  return deny();
});

export const viewAlbum = defineAbility(
  { allowGuest: true },
  (
    user: User | null,
    album: typeof albumSchema.$inferSelect,
    allowPublic: boolean = false,
  ) => {
    if (allowPublic && album.sharingAllowed) {
      return allow();
    }

    if (album.visibility === AlbumVisibility.PUBLIC) {
      return allow();
    }

    if (album.visibility === AlbumVisibility.AUTHENTICATED && !!user) {
      return allow();
    }

    if (
      album.visibility === AlbumVisibility.PRIVATE
      && !!user
      && atLeastRole(UserRole.PUBLISHER, user.role)
    ) {
      return allow();
    }

    return deny();
  },
);

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
