import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest } from "@/lib/api-response";
import { IntegrationStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const integrations = await db.integration.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ integrations });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  status: z.nativeEnum(IntegrationStatus).optional(),
  url: z.string().optional(),
  docsUrl: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const integration = await db.integration.create({ data: parsed.data });

  await logActivity({
    type: "integration.created",
    title: `Integração adicionada via Hermes: ${integration.name}`,
    entityType: "integration",
    entityId: integration.id,
    projectId: integration.projectId,
  });

  return NextResponse.json({ integration }, { status: 201 });
}
