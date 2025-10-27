import { listUsers } from "~~/shared/utils/abilities";

export default defineEventHandler(async (event) => {
  await authorize(event, listUsers);

  const db = useDrizzle();
  return await db.query.user.findMany({
    with: {
      providers: true,
    },
  });
});
