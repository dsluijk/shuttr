import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../database/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null;

export function useDrizzle() {
  if (!db) {
    db = drizzle({
      connection: { connectionString: process.env.DATABASE_URL },
      schema,
    });
  }

  return db;
}

export const tables = schema;
