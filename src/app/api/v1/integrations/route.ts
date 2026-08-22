import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const integrations = await db.integration.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ integrations });
}
