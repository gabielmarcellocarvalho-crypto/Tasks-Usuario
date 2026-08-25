import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskRow, type TaskRowData } from "@/components/tasks/task-row";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { ActivityList } from "@/components/activity/activity-list";
import { ProjectStatusMenu } from "@/components/projects/project-status-menu";
import { DeleteProjectDetailButton } from "@/components/projects/delete-project-detail-button";
import { PROJECT_STATUS_META } from "@/lib/project-meta";
import { formatDateFull, formatDuration, startOfDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ status: "asc" }, { priority: "desc" }],
        include: { timeEntries: { where: { endedAt: null }, take: 1 } },
      },
      knowledgeItems: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!project) notFound();

  const timeByTask = await db.timeEntry.groupBy({
    by: ["taskId"],
    where: { task: { projectId: id } },
    _sum: { durationSeconds: true },
  });
  const timeMap = new Map(timeByTask.map((t) => [t.taskId, t._sum.durationSeconds ?? 0]));
  const totalSeconds = timeByTask.reduce((sum, t) => sum + (t._sum.durationSeconds ?? 0), 0);

  const activities = await db.activity.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const todayStart = startOfDay();
  const rows: TaskRowData[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    done: task.status === "DONE",
    overdue: !!task.dueDate && task.dueDate < todayStart && task.status !== "DONE",
    dueDate: task.dueDate?.toISOString() ?? null,
    dueTime: task.dueTime,
    runningEntry: task.timeEntries[0]
      ? { id: task.timeEntries[0].id, startedAt: task.timeEntries[0].startedAt.toISOString() }
      : null,
  }));
  const doneCount = project.tasks.filter((t) => t.status === "DONE").length;
  const statusMeta = PROJECT_STATUS_META[project.status];

  const tasksByTime = [...project.tasks]
    .map((t) => ({ id: t.id, title: t.title, seconds: timeMap.get(t.id) ?? 0 }))
    .filter((t) => t.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/projetos"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Projetos
      </Link>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <Badge variant="outline" className={cn("text-[11px]", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ProjectStatusMenu projectId={project.id} currentStatus={project.status} />
            <DeleteProjectDetailButton projectId={project.id} />
          </div>
        </div>
        {project.description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Criado em {formatDateFull(project.createdAt)}</span>
          <span>
            {doneCount}/{project.tasks.length} tarefas concluídas
          </span>
          <span>{formatDuration(totalSeconds)} investidas</span>
        </div>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="tempo">Tempo</TabsTrigger>
          <TabsTrigger value="conhecimento">Conhecimento</TabsTrigger>
          <TabsTrigger value="atividade">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="flex flex-col gap-3 pt-3">
          <ActivityList
            items={activities.slice(0, 8).map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
          />
        </TabsContent>

        <TabsContent value="tarefas" className="flex flex-col gap-2 pt-3">
          <div className="flex justify-end">
            <CreateTaskDialog projects={[{ id: project.id, name: project.name }]} />
          </div>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma tarefa neste projeto ainda.
            </div>
          ) : (
            rows.map((task) => (
              <TaskRow key={task.id} task={task} projects={[{ id: project.id, name: project.name }]} />
            ))
          )}
        </TabsContent>

        <TabsContent value="tempo" className="pt-3">
          {tasksByTime.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Ainda não há tempo registrado neste projeto.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {tasksByTime.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm"
                >
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatDuration(t.seconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conhecimento" className="pt-3">
          {project.knowledgeItems.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum documento vinculado a este projeto.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {project.knowledgeItems.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/conhecimento?doc=${doc.id}`}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm hover:bg-card"
                >
                  <span className="truncate">{doc.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{doc.type}</span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="atividade" className="pt-3">
          <ActivityList
            items={activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
