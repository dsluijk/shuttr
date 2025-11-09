import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema/*",
  out: "./server/database/migrations",
  extensionsFilters: ["postgis"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_HOST) || 5432,
    database: process.env.DATABASE_DB ?? "shuttr",
    user: process.env.DATABASE_USER ?? "",
    password: process.env.DATABASE_PASSWORD ?? "",
  },
});
