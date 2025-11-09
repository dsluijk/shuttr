import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../database/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null;

export function useDrizzle() {
  if (!db) {
    db = drizzle({
      connection: {
        connectionString: process.env.DATABASE_URL,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_HOST) || undefined,
        database: process.env.DATABASE_DB,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
      },
      schema,
    });
  }

  return db;
}

export const tables = schema;
