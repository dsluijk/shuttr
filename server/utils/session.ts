import type { H3Event } from "h3";

export const requireSessionUser = async (event: H3Event) => {
  const { user } = await getUserSession(event);

  if (user) {
    const db = useDrizzle();
    const stored = await db.query.user.findFirst({
      where: (t, { eq }) => eq(t.id, user.id),
    });

    if (stored) {
      return stored;
    }
  }

  await clearUserSession(event);
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
};
