import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized } from "@/lib/api-response";
import { getCriticalAlerts } from "@/lib/alerts";

// GET /api/v1/alerts — the same "what needs attention" feed the dashboard
// shows, so Hermes answering "what needs my attention today?" always
// matches what's on screen.
export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const alerts = await getCriticalAlerts();
  return NextResponse.json({ alerts });
}
