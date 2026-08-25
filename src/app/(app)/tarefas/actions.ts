"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { TaskPriority, TaskStatus } from "@/generated/prisma/client";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  projectId: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NORMAL),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  dueDate: z.string().optional(), // yyyy-mm-dd
  dueTime: z.string().optional(), // HH:mm
  category: z.string().trim().optional(),
});

export async function createTask(formData: FormData) {
  const parsed = createTaskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    projectId: formData.get("projectId") || undefined,
    priority: formData.get("priority") || TaskPriority.NORMAL,
    status: formData.get("status") || TaskStatus.TODO,
    dueDate: formData.get("dueDate") || undefined,
    dueTime: formData.get("dueTime") || undefined,
    category: formData.get("category") || undefined,
  });

  const task = await db.task.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      projectId: parsed.projectId || undefined,
      priority: parsed.priority,
      status: parsed.status,
      dueDate: parsed.dueDate ? new Date(`${parsed.dueDate}T00:00:00`) : undefined,
      dueTime: parsed.dueTime,
      category: parsed.category,
    },
  });

  await logActivity({
    type: "task.created",
    title: `Tarefa criada: ${task.title}`,
    entityType: "task",
    entityId: task.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/");
  revalidatePath("/tarefas");
  if (task.projectId) revalidatePath(`/projetos/${task.projectId}`);
  return task;
}

const updateTaskSchema = createTaskSchema.extend({ id: z.string() });

export async function updateTask(formData: FormData) {
  const parsed = updateTaskSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    projectId: formData.get("projectId") || undefined,
    priority: formData.get("priority") || TaskPriority.NORMAL,
    status: formData.get("status") || TaskStatus.TODO,
    dueDate: formData.get("dueDate") || undefined,
    dueTime: formData.get("dueTime") || undefined,
    category: formData.get("category") || undefined,
  });

  const previous = await db.task.findUniqueOrThrow({ where: { id: parsed.id } });

  const task = await db.task.update({
    where: { id: parsed.id },
    data: {
      title: parsed.title,
      description: parsed.description,
      projectId: parsed.projectId || null,
      priority: parsed.priority,
      status: parsed.status,
      dueDate: parsed.dueDate ? new Date(`${parsed.dueDate}T00:00:00`) : null,
      dueTime: parsed.dueTime || null,
      category: parsed.category,
      completedAt:
        parsed.status === TaskStatus.DONE
          ? (previous.completedAt ?? new Date())
          : parsed.status !== previous.status
            ? null
            : previous.completedAt,
    },
  });

  await logActivity({
    type: "task.updated",
    title: `Tarefa editada: ${task.title}`,
    entityType: "task",
    entityId: task.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/");
  revalidatePath("/tarefas");
  if (previous.projectId) revalidatePath(`/projetos/${previous.projectId}`);
  if (task.projectId && task.projectId !== previous.projectId) {
    revalidatePath(`/projetos/${task.projectId}`);
  }
  return task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const task = await db.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === TaskStatus.DONE ? new Date() : null,
    },
  });

  await logActivity({
    type: status === TaskStatus.DONE ? "task.completed" : "task.updated",
    title:
      status === TaskStatus.DONE
        ? `Concluiu "${task.title}"`
        : `Atualizou status de "${task.title}"`,
    entityType: "task",
    entityId: task.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/");
  revalidatePath("/tarefas");
  if (task.projectId) revalidatePath(`/projetos/${task.projectId}`);
  return task;
}

export async function toggleTaskDone(taskId: string) {
  const task = await db.task.findUniqueOrThrow({ where: { id: taskId } });
  const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
  return updateTaskStatus(taskId, nextStatus);
}

export async function deleteTask(taskId: string) {
  const task = await db.task.delete({ where: { id: taskId } });
  revalidatePath("/");
  revalidatePath("/tarefas");
  if (task.projectId) revalidatePath(`/projetos/${task.projectId}`);
}

export async function startTimer(taskId: string) {
  const running = await db.timeEntry.findFirst({
    where: { taskId, endedAt: null },
  });
  if (running) return running;

  const entry = await db.timeEntry.create({
    data: { taskId, startedAt: new Date() },
  });

  if ((await db.task.findUnique({ where: { id: taskId } }))?.status === TaskStatus.TODO) {
    await db.task.update({ where: { id: taskId }, data: { status: TaskStatus.IN_PROGRESS } });
  }

  revalidatePath("/");
  revalidatePath("/tarefas");
  return entry;
}

export async function stopTimer(timeEntryId: string) {
  const existing = await db.timeEntry.findUniqueOrThrow({ where: { id: timeEntryId } });
  const endedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.round((endedAt.getTime() - existing.startedAt.getTime()) / 1000),
  );

  const entry = await db.timeEntry.update({
    where: { id: timeEntryId },
    data: { endedAt, durationSeconds },
  });

  const task = await db.task.findUnique({ where: { id: existing.taskId } });

  revalidatePath("/");
  revalidatePath("/tarefas");
  if (task?.projectId) revalidatePath(`/projetos/${task.projectId}`);
  return entry;
}

export async function getTaskById(taskId: string) {
  return db.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function getRunningTimer(taskId: string) {
  return db.timeEntry.findFirst({ where: { taskId, endedAt: null } });
}
