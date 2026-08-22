import { db } from "@/lib/db";

type LogActivityInput = {
  type: string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  projectId?: string | null;
  taskId?: string | null;
};

/**
 * Records a timeline entry and queues a Hermes-consumable event in the same
 * write path, so every module stays part of the same activity/event stream
 * instead of drifting into isolated feature silos.
 */
export async function logActivity(input: LogActivityInput) {
  const [activity] = await Promise.all([
    db.activity.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        entityType: input.entityType,
        entityId: input.entityId,
        projectId: input.projectId ?? undefined,
        taskId: input.taskId ?? undefined,
      },
    }),
    db.event.create({
      data: {
        type: input.type,
        payload: JSON.stringify({
          title: input.title,
          description: input.description,
          entityType: input.entityType,
          entityId: input.entityId,
          projectId: input.projectId,
          taskId: input.taskId,
        }),
      },
    }),
  ]);
  return activity;
}
