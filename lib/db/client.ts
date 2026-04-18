import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "@/lib/db/schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: Pool | null = null;

export function getDb() {
  if (!env.DATABASE_URL_RESOLVED) {
    throw new Error("Database URL missing. Set POSTGRES_URL or DATABASE_URL in .env.local");
  }
  if (!dbInstance) {
    poolInstance = new Pool({ connectionString: env.DATABASE_URL_RESOLVED });
    dbInstance = drizzle({ client: poolInstance, schema });
  }
  return dbInstance;
}

export { schema };
