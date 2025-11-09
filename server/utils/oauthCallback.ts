import type { H3Event } from "h3";
import { eq, sql } from "drizzle-orm";

import type { UserRole } from "../database/schema/user";
import type { ProviderEnum } from "../database/schema/userProvider";

interface OAuthCallbackUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
}

// Helper function to handle OAuth callbacks.
// This ensures the user and provider exists in the database, and sets the session data correctly.
export const handleOAuthCallback = async (
  event: H3Event,
  providerUsed: ProviderEnum,
  oauthUser: OAuthCallbackUser,
  defaultRole: UserRole,
) => {
  if (!oauthUser.email_verified) {
    throw createError({
      statusCode: 403,
      message: "Your email is not verified by the provider.",
      data: { sub: oauthUser.sub, provider: providerUsed },
    });
  }

  const db = useDrizzle();
  let provider = await db.query.userProvider.findFirst({
    where: (t, { and, eq }) =>
      and(eq(t.provider, providerUsed), eq(t.providerUserId, oauthUser.sub)),
    with: { user: true },
  });

  if (!provider) {
    // The user provider does not exists.
    // Either the user does not exists, or the user has not logged in with this provider.
    let user = await db.query.user.findFirst({
      where: (t, { and, eq }) => and(eq(t.email, oauthUser.email)),
    });

    if (!user) {
      // Create the user as it does not exists.

      const userCreateResult = await db
        .insert(tables.user)
        .values({
          name: oauthUser.name,
          email: oauthUser.email,
          role: defaultRole,
        })
        .returning();

      if (userCreateResult.length !== 1) {
        throw createError({
          statusCode: 500,
          message: "The user account cannot be created.",
        });
      }

      user = userCreateResult[0];
    }

    // Create the provider for the user.
    const providerCreateResult = await db
      .insert(tables.userProvider)
      .values({
        userId: user.id,
        provider: providerUsed,
        providerUserId: oauthUser.sub,
      })
      .returning();

    if (providerCreateResult.length !== 1) {
      throw createError({
        statusCode: 500,
        message: "The user account provider cannot be created.",
      });
    }

    provider = {
      ...providerCreateResult[0],
      user,
    };
  }

  // Update last seen for the user provider.
  await db
    .update(tables.userProvider)
    .set({
      lastSeen: sql`now()`,
    })
    .where(eq(tables.userProvider.id, provider.id));

  // Set session data correctly.
  await setUserSession(
    event,
    {
      provider: provider.provider,
      providerId: provider.id,
      user: {
        id: provider.user.id,
        name: provider.user.name,
        email: provider.user.email,
        role: provider.user.role,
      },
    },
    {
      maxAge: 60 * 60 * 24 * 7,
    },
  );

  return provider;
};
