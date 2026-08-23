import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { PROJECT_STATUS_META } from "@/lib/project-meta";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProjetosPage() {
  const projects = await db.project.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      tasks: { select: { status: true, timeEntries: { select: { durationSeconds: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} projetos</p>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum projeto ainda. Crie o primeiro para começar a organizar suas tarefas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const done = project.tasks.filter((t) => t.status === "DONE").length;
            const seconds = project.tasks.reduce(
              (sum, t) =>
                sum + t.timeEntries.reduce((s, e) => s + (e.durationSeconds ?? 0), 0),
              0,
            );
            const statusMeta = PROJECT_STATUS_META[project.status];

            return (
              <div key={project.id} className="group relative">
                <Link
                  href={`/projetos/${project.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="truncate text-sm font-semibold">{project.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[11px]", statusMeta.className)}
                    >
                      {statusMeta.label}
                    </Badge>
                  </div>
                  {project.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {done}/{project.tasks.length} tarefas
                    </span>
                    <span>{formatDuration(seconds)}</span>
                  </div>
                </Link>
                <div className="absolute -right-2 -top-2">
                  <DeleteProjectButton projectId={project.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
