"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/api-auth";

const createClientSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export async function createApiClient(name: string) {
  createClientSchema.parse({ name });
  const token = generateToken();

  await db.apiClient.create({
    data: { name, tokenHash: hashToken(token) },
  });

  revalidatePath("/hermes");
  return { token };
}

export async function revokeApiClient(id: string) {
  await db.apiClient.update({ where: { id }, data: { active: false } });
  revalidatePath("/hermes");
}
