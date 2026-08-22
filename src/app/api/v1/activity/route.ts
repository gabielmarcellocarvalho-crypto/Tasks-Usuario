import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const activities = await db.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });
  return NextResponse.json({ activities });
}
