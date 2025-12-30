import { migrate } from "drizzle-orm/node-postgres/migrator";

export default defineNitroPlugin(async (a) => {
  const db = useDrizzle();

  try {
    await migrate(db, {
      migrationsTable: "_drizzle_migrations",
      migrationsSchema: "public",
      migrationsFolder: process.cwd() + "/server/database/migrations",
    });
    console.info("Migrations applied");
  } catch (e) {
    console.error("Failed to execute migrations!");
    console.error(e);
  }
});
