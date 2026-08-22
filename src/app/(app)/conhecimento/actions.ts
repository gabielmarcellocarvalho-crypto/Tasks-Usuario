"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { KnowledgeType } from "@/generated/prisma/client";

const createKnowledgeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().max(50000).optional(),
  type: z.nativeEnum(KnowledgeType).default(KnowledgeType.NOTE),
  tags: z.string().trim().optional(),
  projectId: z.string().optional(),
});

function parseTags(raw?: string): string {
  if (!raw) return "[]";
  return JSON.stringify(raw.split(",").map((t) => t.trim()).filter(Boolean));
}

export async function createKnowledgeItem(formData: FormData) {
  const parsed = createKnowledgeSchema.parse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    type: formData.get("type") || KnowledgeType.NOTE,
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const item = await db.knowledgeItem.create({
    data: {
      title: parsed.title,
      content: parsed.content ?? "",
      type: parsed.type,
      tags: parseTags(parsed.tags),
      projectId: parsed.projectId || undefined,
    },
  });

  await logActivity({
    type: "knowledge.created",
    title: `Documento criado: ${item.title}`,
    entityType: "knowledge",
    entityId: item.id,
    projectId: item.projectId,
  });

  revalidatePath("/conhecimento");
  if (item.projectId) revalidatePath(`/projetos/${item.projectId}`);
  return item;
}

const updateKnowledgeSchema = createKnowledgeSchema.extend({ id: z.string() });

export async function updateKnowledgeItem(formData: FormData) {
  const parsed = updateKnowledgeSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    type: formData.get("type") || KnowledgeType.NOTE,
    tags: formData.get("tags") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const item = await db.knowledgeItem.update({
    where: { id: parsed.id },
    data: {
      title: parsed.title,
      content: parsed.content ?? "",
      type: parsed.type,
      tags: parseTags(parsed.tags),
      projectId: parsed.projectId || null,
    },
  });

  await logActivity({
    type: "knowledge.updated",
    title: `Documento atualizado: ${item.title}`,
    entityType: "knowledge",
    entityId: item.id,
    projectId: item.projectId,
  });

  revalidatePath("/conhecimento");
  if (item.projectId) revalidatePath(`/projetos/${item.projectId}`);
  return item;
}

export async function deleteKnowledgeItem(id: string) {
  const item = await db.knowledgeItem.delete({ where: { id } });
  revalidatePath("/conhecimento");
  if (item.projectId) revalidatePath(`/projetos/${item.projectId}`);
}
