import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized } from "@/lib/api-response";

// GET /api/v1/events?since=<ISO timestamp>
// Hermes polls this to drive webhook-style notifications (deadline.expiring,
// task.completed, integration.error, ...). Fetching marks events delivered
// so repeated polls don't replay the same ones.
export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const since = req.nextUrl.searchParams.get("since");
  const events = await db.event.findMany({
    where: since ? { createdAt: { gt: new Date(since) } } : { deliveredToHermes: false },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  if (events.length > 0) {
    await db.event.updateMany({
      where: { id: { in: events.map((e) => e.id) } },
      data: { deliveredToHermes: true, deliveredAt: new Date() },
    });
  }

  return NextResponse.json({
    events: events.map((e) => ({ ...e, payload: JSON.parse(e.payload) })),
  });
}
