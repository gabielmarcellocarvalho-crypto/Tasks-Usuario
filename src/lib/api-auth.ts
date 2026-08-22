import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Authenticates a request from Hermes (or any external client) using a
 * bearer token. Updates the client's lastSeenAt as a heartbeat side effect
 * so the Hermes status widget reflects real connectivity.
 */
export async function authenticateApiRequest(req: NextRequest) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const client = await db.apiClient.findFirst({
    where: { tokenHash: hashToken(token), active: true },
  });
  if (!client) return null;

  await db.apiClient.update({ where: { id: client.id }, data: { lastSeenAt: new Date() } });
  return client;
}
