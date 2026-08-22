import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest } from "@/lib/api-response";
import { ProjectStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const status = req.nextUrl.searchParams.get("status") as ProjectStatus | null;
  const projects = await db.project.findMany({
    where: { status: status ?? undefined },
    include: { _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ projects });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
});

export async function POST(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const project = await db.project.create({ data: parsed.data });
  await logActivity({
    type: "project.created",
    title: `Projeto criado via Hermes: ${project.name}`,
    entityType: "project",
    entityId: project.id,
    projectId: project.id,
  });

  return NextResponse.json({ project }, { status: 201 });
}
