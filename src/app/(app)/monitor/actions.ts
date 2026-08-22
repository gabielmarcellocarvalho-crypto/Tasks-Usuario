"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { DeadlineType } from "@/generated/prisma/client";

const createDeadlineSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.nativeEnum(DeadlineType).default(DeadlineType.OTHER),
  description: z.string().trim().max(2000).optional(),
  dueDate: z.string().min(1),
  dueTime: z.string().optional(),
  url: z.string().trim().max(500).optional(),
  responsible: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  periodicity: z.string().trim().max(50).optional(),
  projectId: z.string().optional(),
});

export async function createDeadline(formData: FormData) {
  const parsed = createDeadlineSchema.parse({
    name: formData.get("name"),
    type: formData.get("type") || DeadlineType.OTHER,
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime") || undefined,
    url: formData.get("url") || undefined,
    responsible: formData.get("responsible") || undefined,
    notes: formData.get("notes") || undefined,
    periodicity: formData.get("periodicity") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const dueAt = new Date(`${parsed.dueDate}T${parsed.dueTime || "23:59"}:00`);

  const deadline = await db.deadline.create({
    data: {
      name: parsed.name,
      type: parsed.type,
      description: parsed.description,
      dueAt,
      url: parsed.url,
      responsible: parsed.responsible,
      notes: parsed.notes,
      periodicity: parsed.periodicity,
      projectId: parsed.projectId || undefined,
    },
  });

  await logActivity({
    type: "deadline.created",
    title: `Prazo criado: ${deadline.name}`,
    entityType: "deadline",
    entityId: deadline.id,
    projectId: deadline.projectId,
  });

  revalidatePath("/monitor");
  revalidatePath("/");
  return deadline;
}

const updateDeadlineSchema = createDeadlineSchema.extend({ id: z.string() });

export async function updateDeadline(formData: FormData) {
  const parsed = updateDeadlineSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type") || DeadlineType.OTHER,
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime") || undefined,
    url: formData.get("url") || undefined,
    responsible: formData.get("responsible") || undefined,
    notes: formData.get("notes") || undefined,
    periodicity: formData.get("periodicity") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const dueAt = new Date(`${parsed.dueDate}T${parsed.dueTime || "23:59"}:00`);

  const deadline = await db.deadline.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      type: parsed.type,
      description: parsed.description,
      dueAt,
      url: parsed.url,
      responsible: parsed.responsible,
      notes: parsed.notes,
      periodicity: parsed.periodicity,
      projectId: parsed.projectId || null,
    },
  });

  await logActivity({
    type: "deadline.updated",
    title: `Prazo atualizado: ${deadline.name}`,
    entityType: "deadline",
    entityId: deadline.id,
    projectId: deadline.projectId,
  });

  revalidatePath("/monitor");
  revalidatePath("/");
  return deadline;
}

export async function deleteDeadline(id: string) {
  await db.deadline.delete({ where: { id } });
  revalidatePath("/monitor");
  revalidatePath("/");
}
