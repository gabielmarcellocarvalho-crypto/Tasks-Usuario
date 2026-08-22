import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest } from "@/lib/api-response";
import { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { startOfDay, endOfDay } from "@/lib/format";

// GET /api/v1/tasks?status=&overdue=1&today=1&projectId=
export async function GET(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") as TaskStatus | null;
  const projectId = searchParams.get("projectId");
  const overdue = searchParams.get("overdue") === "1";
  const today = searchParams.get("today") === "1";

  const now = new Date();
  const tasks = await db.task.findMany({
    where: {
      status: status ?? undefined,
      projectId: projectId ?? undefined,
      ...(overdue ? { dueDate: { lt: startOfDay(now) }, status: { not: "DONE" } } : {}),
      ...(today ? { dueDate: { gte: startOfDay(now), lte: endOfDay(now) } } : {}),
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { project: { select: { id: true, name: true } } },
    take: 200,
  });

  return NextResponse.json({ tasks });
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  projectId: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
});

// POST /api/v1/tasks — used by Hermes to create tasks from chat commands.
export async function POST(req: NextRequest) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const task = await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      projectId: parsed.data.projectId,
      priority: parsed.data.priority,
      status: parsed.data.status,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      dueTime: parsed.data.dueTime,
    },
  });

  await logActivity({
    type: "task.created",
    title: `Tarefa criada via Hermes: ${task.title}`,
    entityType: "task",
    entityId: task.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  return NextResponse.json({ task }, { status: 201 });
}
