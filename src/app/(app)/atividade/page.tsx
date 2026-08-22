import { db } from "@/lib/db";
import { ActivityList } from "@/components/activity/activity-list";

export default async function AtividadePage() {
  const activities = await db.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { project: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Linha do tempo de tudo que aconteceu na plataforma.
      </p>
      <ActivityList
        items={activities.map((a) => ({
          id: a.id,
          type: a.type,
          title: a.project ? `${a.title} · ${a.project.name}` : a.title,
          description: a.description,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
