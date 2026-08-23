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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
