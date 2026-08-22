"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function markNotificationRead(id: string) {
  await db.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  await db.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}
