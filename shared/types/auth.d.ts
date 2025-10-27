import type { UserRole } from "~~/server/database/schema/user";
import type { ProviderEnum } from "~~/server/database/schema/userProvider";

declare module "#auth-utils" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }

  interface UserSession {
    provider: ProviderEnum;
    providerId: string;
  }
}

export {};
