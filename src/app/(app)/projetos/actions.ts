"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { ProjectStatus } from "@/generated/prisma/client";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  color: z.string().trim().optional(),
});

export async function createProject(formData: FormData) {
  const parsed = createProjectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });

  const project = await db.project.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      color: parsed.color || undefined,
    },
  });

  await logActivity({
    type: "project.created",
    title: `Projeto criado: ${project.name}`,
    entityType: "project",
    entityId: project.id,
    projectId: project.id,
  });

  revalidatePath("/projetos");
  revalidatePath("/");
  return project;
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const project = await db.project.update({
    where: { id: projectId },
    data: { status, completedAt: status === ProjectStatus.COMPLETED ? new Date() : null },
  });

  await logActivity({
    type: "project.updated",
    title: `Projeto "${project.name}" marcado como ${status.toLowerCase()}`,
    entityType: "project",
    entityId: project.id,
    projectId: project.id,
  });

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${projectId}`);
  revalidatePath("/");
  return project;
}
