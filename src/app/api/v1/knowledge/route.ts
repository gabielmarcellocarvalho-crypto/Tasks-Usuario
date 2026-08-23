import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest } from "@/lib/api-response";
import { KnowledgeType } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const items = await db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ knowledge: items });
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(50000).optional(),
  type: z.nativeEnum(KnowledgeType).optional(),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const item = await db.knowledgeItem.create({
    data: { ...parsed.data, content: parsed.data.content ?? "" },
  });

  await logActivity({
    type: "knowledge.created",
    title: `Documento criado via Hermes: ${item.title}`,
    entityType: "knowledge",
    entityId: item.id,
    projectId: item.projectId,
  });

  return NextResponse.json({ knowledge: item }, { status: 201 });
}
