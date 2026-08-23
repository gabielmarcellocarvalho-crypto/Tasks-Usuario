import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // DATABASE_URL points at the pooled (PgBouncer) endpoint, not the direct
  // one — a personal single-user app doesn't need many real Postgres
  // connections, but every dev-server restart otherwise leaves its old pool
  // dangling until Postgres reaps it, and a low direct-connection cap gets
  // exhausted fast. The pooler multiplexes instead of exhausting it.
  //
  // On Vercel, many serverless instances can each spin up their own pool
  // at once (e.g. right after a deploy) — keep each instance's slice small
  // so a burst of cold starts doesn't pressure the pooler's own connection
  // limit. Locally there's only ever one process, so a few more are fine.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.VERCEL ? 1 : 5,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
