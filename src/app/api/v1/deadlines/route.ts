import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest } from "@/lib/api-response";
import { classifyDeadline } from "@/lib/status";
import { DeadlineType } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const withinDays = req.nextUrl.searchParams.get("withinDays");
  const deadlines = await db.deadline.findMany({ orderBy: { dueAt: "asc" } });

  const filtered = withinDays
    ? deadlines.filter((d) => {
        const diffDays = (d.dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diffDays <= Number(withinDays);
      })
    : deadlines;

  return NextResponse.json({
    deadlines: filtered.map((d) => ({ ...d, level: classifyDeadline(d.dueAt) })),
  });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.nativeEnum(DeadlineType).optional(),
  dueAt: z.string().min(1),
  projectId: z.string().optional(),
  url: z.string().optional(),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const deadline = await db.deadline.create({
    data: { ...parsed.data, dueAt: new Date(parsed.data.dueAt) },
  });

  await logActivity({
    type: "deadline.created",
    title: `Prazo criado via Hermes: ${deadline.name}`,
    entityType: "deadline",
    entityId: deadline.id,
    projectId: deadline.projectId,
  });

  return NextResponse.json({ deadline }, { status: 201 });
}
