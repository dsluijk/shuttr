import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const getDbCredentials = () => {
  if (process.env.DATABASE_URL?.trim().length) {
    return {
      url: process.env.DATABASE_URL,
    };
  } else {
    return {
      host: process.env.DATABASE_HOST || "localhost",
      port: Number(process.env.DATABASE_HOST) || 5432,
      user: process.env.DATABASE_USER || undefined,
      password: process.env.DATABASE_PASSWORD || undefined,
      database: process.env.DATABASE_DB || "drizzle",
      ssl: process.env.DATABASE_SSL === "true",
    };
  }
};

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema/*",
  out: "./server/database/migrations",
  extensionsFilters: ["postgis"],
  migrations: {
    table: "_drizzle_migrations",
    schema: "public",
  },
  dbCredentials: getDbCredentials(),
});
