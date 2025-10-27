import type { User } from "#auth-utils";
import { allow, defineAbility, deny } from "#imports";
import { UserRole } from "~~/server/database/schema/user";

export const listUsers = defineAbility((user: User) => {
  if (user.role === UserRole.ADMIN) {
    return allow();
  }

  return deny();
});
