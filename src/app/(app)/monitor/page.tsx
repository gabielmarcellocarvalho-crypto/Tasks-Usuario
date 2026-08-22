import { db } from "@/lib/db";
import { CreateDeadlineDialog } from "@/components/monitor/create-deadline-dialog";
import { DeadlineCard } from "@/components/monitor/deadline-card";
import { classifyDeadline } from "@/lib/status";

export default async function MonitorPage() {
  const [deadlines, projects] = await Promise.all([
    db.deadline.findMany({
      orderBy: { dueAt: "asc" },
      include: { project: { select: { name: true } } },
    }),
    db.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const critical = deadlines.filter((d) =>
    ["expired", "critical"].includes(classifyDeadline(d.dueAt)),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {deadlines.length} prazos monitorados
          {critical > 0 ? ` · ${critical} críticos` : ""}
        </p>
        <CreateDeadlineDialog projects={projects} />
      </div>

      {deadlines.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum prazo cadastrado. Adicione APIs, domínios, tokens ou assinaturas para acompanhar
          os vencimentos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {deadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              projects={projects}
              deadline={{
                id: deadline.id,
                name: deadline.name,
                type: deadline.type,
                dueAt: deadline.dueAt.toISOString(),
                url: deadline.url,
                responsible: deadline.responsible,
                notes: deadline.notes,
                projectId: deadline.projectId,
                projectName: deadline.project?.name,
                periodicity: deadline.periodicity,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
