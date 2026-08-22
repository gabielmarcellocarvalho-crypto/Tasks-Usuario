"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { IntegrationStatus } from "@/generated/prisma/client";

const createIntegrationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  status: z.nativeEnum(IntegrationStatus).default(IntegrationStatus.CONNECTED),
  url: z.string().trim().max(500).optional(),
  docsUrl: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
  projectId: z.string().optional(),
});

export async function createIntegration(formData: FormData) {
  const parsed = createIntegrationSchema.parse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    status: formData.get("status") || IntegrationStatus.CONNECTED,
    url: formData.get("url") || undefined,
    docsUrl: formData.get("docsUrl") || undefined,
    notes: formData.get("notes") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const integration = await db.integration.create({
    data: { ...parsed, projectId: parsed.projectId || undefined },
  });

  await logActivity({
    type: "integration.created",
    title: `Integração adicionada: ${integration.name}`,
    entityType: "integration",
    entityId: integration.id,
    projectId: integration.projectId,
  });

  revalidatePath("/integracoes");
  return integration;
}

export async function updateIntegrationStatus(id: string, status: IntegrationStatus) {
  const integration = await db.integration.update({
    where: { id },
    data: { status, lastSyncAt: new Date() },
  });

  await logActivity({
    type: status === "ERROR" ? "integration.error" : "integration.updated",
    title: `Integração ${integration.name}: ${status.toLowerCase()}`,
    entityType: "integration",
    entityId: integration.id,
    projectId: integration.projectId,
  });

  revalidatePath("/integracoes");
  revalidatePath("/");
  return integration;
}

const updateIntegrationSchema = createIntegrationSchema.extend({ id: z.string() });

export async function updateIntegration(formData: FormData) {
  const parsed = updateIntegrationSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    status: formData.get("status") || IntegrationStatus.CONNECTED,
    url: formData.get("url") || undefined,
    docsUrl: formData.get("docsUrl") || undefined,
    notes: formData.get("notes") || undefined,
    projectId: formData.get("projectId") || undefined,
  });

  const integration = await db.integration.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      category: parsed.category,
      status: parsed.status,
      url: parsed.url,
      docsUrl: parsed.docsUrl,
      notes: parsed.notes,
      projectId: parsed.projectId || null,
    },
  });

  await logActivity({
    type: "integration.updated",
    title: `Integração atualizada: ${integration.name}`,
    entityType: "integration",
    entityId: integration.id,
    projectId: integration.projectId,
  });

  revalidatePath("/integracoes");
  return integration;
}

export async function deleteIntegration(id: string) {
  await db.integration.delete({ where: { id } });
  revalidatePath("/integracoes");
}
