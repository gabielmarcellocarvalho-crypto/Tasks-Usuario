"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { imageToDataUrl } from "@/lib/upload";
import { ComponentKind } from "@/generated/prisma/client";

const createComponentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  kind: z.nativeEnum(ComponentKind).default(ComponentKind.COMPONENT),
  category: z.string().trim().max(100).optional(),
  technology: z.string().trim().max(100).optional(),
  tags: z.string().trim().optional(),
  description: z.string().trim().max(2000).optional(),
  origin: z.string().trim().max(200).optional(),
  originUrl: z.string().trim().max(500).optional(),
  code: z.string().trim().max(50000).optional(),
  language: z.string().trim().max(50).optional(),
});

function parseTags(raw?: string): string {
  if (!raw) return "[]";
  const tags = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(tags);
}

export async function createComponent(formData: FormData) {
  const parsed = createComponentSchema.parse({
    name: formData.get("name"),
    kind: formData.get("kind") || ComponentKind.COMPONENT,
    category: formData.get("category") || undefined,
    technology: formData.get("technology") || undefined,
    tags: formData.get("tags") || undefined,
    description: formData.get("description") || undefined,
    origin: formData.get("origin") || undefined,
    originUrl: formData.get("originUrl") || undefined,
    code: formData.get("code") || undefined,
    language: formData.get("language") || undefined,
  });

  const previewImage = formData.get("previewImage");
  const previewUrl =
    previewImage instanceof File && previewImage.size > 0
      ? await imageToDataUrl(previewImage)
      : undefined;

  const component = await db.component.create({
    data: {
      name: parsed.name,
      kind: parsed.kind,
      category: parsed.category,
      technology: parsed.technology,
      tags: parseTags(parsed.tags),
      description: parsed.description,
      origin: parsed.origin,
      originUrl: parsed.originUrl,
      previewUrl,
      versions: parsed.code
        ? {
            create: {
              version: "1.0",
              code: parsed.code,
              language: parsed.language,
              isCurrent: true,
            },
          }
        : undefined,
    },
  });

  await logActivity({
    type: "component.created",
    title: `Componente adicionado: ${component.name}`,
    entityType: "component",
    entityId: component.id,
  });

  revalidatePath("/biblioteca");
  return component;
}

const updateComponentSchema = createComponentSchema.extend({ id: z.string() });

export async function updateComponent(formData: FormData) {
  const parsed = updateComponentSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    kind: formData.get("kind") || ComponentKind.COMPONENT,
    category: formData.get("category") || undefined,
    technology: formData.get("technology") || undefined,
    tags: formData.get("tags") || undefined,
    description: formData.get("description") || undefined,
    origin: formData.get("origin") || undefined,
    originUrl: formData.get("originUrl") || undefined,
    code: formData.get("code") || undefined,
    language: formData.get("language") || undefined,
  });

  const existing = await db.component.findUniqueOrThrow({
    where: { id: parsed.id },
    include: { versions: { where: { isCurrent: true }, take: 1 } },
  });
  const currentVersion = existing.versions[0];
  const codeChanged = !!parsed.code && parsed.code !== currentVersion?.code;

  const previewImage = formData.get("previewImage");
  const previewUrl =
    previewImage instanceof File && previewImage.size > 0
      ? await imageToDataUrl(previewImage)
      : undefined;

  await db.component.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      kind: parsed.kind,
      category: parsed.category,
      technology: parsed.technology,
      tags: parseTags(parsed.tags),
      description: parsed.description,
      origin: parsed.origin,
      originUrl: parsed.originUrl,
      previewUrl,
    },
  });

  if (codeChanged) {
    // Bumping the version instead of overwriting keeps the code history
    // intact (spec section 26) — every save with changed code is a new,
    // retrievable version rather than a silent overwrite.
    const nextVersion = ((parseFloat(currentVersion?.version ?? "0") || 0) + 1).toFixed(1);
    await db.$transaction([
      db.componentVersion.updateMany({
        where: { componentId: parsed.id, isCurrent: true },
        data: { isCurrent: false },
      }),
      db.componentVersion.create({
        data: {
          componentId: parsed.id,
          version: nextVersion,
          code: parsed.code!,
          language: parsed.language,
          isCurrent: true,
        },
      }),
    ]);
  }

  await logActivity({
    type: "component.updated",
    title: `Componente atualizado: ${parsed.name}`,
    entityType: "component",
    entityId: parsed.id,
  });

  revalidatePath("/biblioteca");
}

export async function toggleFavorite(id: string) {
  const component = await db.component.findUniqueOrThrow({ where: { id } });
  await db.component.update({ where: { id }, data: { favorite: !component.favorite } });
  revalidatePath("/biblioteca");
}

export async function deleteComponent(id: string) {
  await db.component.delete({ where: { id } });
  revalidatePath("/biblioteca");
}

export async function recordComponentUsage(componentId: string, projectId: string, note?: string) {
  const usage = await db.componentUsage.create({
    data: { componentId, projectId, note },
  });
  revalidatePath("/biblioteca");
  revalidatePath(`/projetos/${projectId}`);
  return usage;
}
