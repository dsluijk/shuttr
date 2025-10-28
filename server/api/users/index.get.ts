export default defineEventHandler(async (event) => {
  await authorize(event, listUsers);

  const db = useDrizzle();
  return await db.query.user.findMany({
    orderBy: (user, { asc }) => [asc(user.name)],
    with: {
      providers: true,
    },
  });
});
