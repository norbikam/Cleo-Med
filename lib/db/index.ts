import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

// In dev, reuse the client across HMR reloads to avoid exhausting
// Supabase pgbouncer's connection limit.
const client =
  process.env.NODE_ENV === "production"
    ? postgres(connectionString, { prepare: false, max: 10 })
    : (global.__pgClient ??= postgres(connectionString, { prepare: false, max: 5 }));

export const db = drizzle(client, { schema });
