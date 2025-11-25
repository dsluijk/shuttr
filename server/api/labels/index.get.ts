export default defineEventHandler(async () => {
  const db = useDrizzle();
  return await db.query.label.findMany({
    orderBy: (label, { asc }) => [asc(label.title)],
  });
});
