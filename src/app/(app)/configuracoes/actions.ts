"use server";

import { revalidatePath } from "next/cache";
import { resetDatabase, seedDemoData } from "@/lib/seed";

export async function resetDemoData() {
  await resetDatabase();
  await seedDemoData();
  revalidatePath("/", "layout");
}

export async function wipeAllData() {
  await resetDatabase();
  revalidatePath("/", "layout");
}
