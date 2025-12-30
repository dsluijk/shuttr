import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../database/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null;

export function useDrizzle() {
  if (!db) {
    const client = process.env.DATABASE_URL?.trim().length
      ? new Pool({
          connectionString: process.env.DATABASE_URL,
        })
      : new Pool({
          host: process.env.DATABASE_HOST || "localhost",
          port: Number(process.env.DATABASE_HOST) || 5432,
          user: process.env.DATABASE_USER || undefined,
          password: process.env.DATABASE_PASSWORD || undefined,
          database: process.env.DATABASE_DB || "drizzle",
          ssl: process.env.DATABASE_SSL === "true",
        });

    db = drizzle({
      client,
      schema,
    });
  }

  return db;
}

export const tables = schema;
