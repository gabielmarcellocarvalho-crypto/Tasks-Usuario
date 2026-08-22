import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { authenticateApiRequest } from "@/lib/api-auth";
import { unauthorized, badRequest, notFound } from "@/lib/api-response";
import { TaskPriority, TaskStatus } from "@/generated/prisma/client";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/v1/tasks/[id]">) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return notFound();

  const task = await db.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate === null
            ? null
            : new Date(parsed.data.dueDate),
      notes: parsed.data.notes,
      completedAt: parsed.data.status === "DONE" ? new Date() : parsed.data.status ? null : undefined,
    },
  });

  await logActivity({
    type: task.status === "DONE" ? "task.completed" : "task.updated",
    title: `Tarefa atualizada via Hermes: ${task.title}`,
    entityType: "task",
    entityId: task.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  return NextResponse.json({ task });
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/v1/tasks/[id]">) {
  const client = await authenticateApiRequest(req);
  if (!client) return unauthorized();

  const { id } = await ctx.params;
  const task = await db.task.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } }, timeEntries: true },
  });
  if (!task) return notFound();
  return NextResponse.json({ task });
}
