import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskRow, type TaskRowData } from "@/components/tasks/task-row";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import type { TaskStatus } from "@/generated/prisma/client";

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const where =
    filter === "overdue"
      ? { status: { not: "DONE" as TaskStatus }, dueDate: { lt: todayStart } }
      : filter === "today"
        ? { status: { not: "DONE" as TaskStatus }, dueDate: { gte: todayStart, lte: todayEnd } }
        : {};

  const [tasks, projects] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        dueTime: true,
        project: { select: { name: true } },
        timeEntries: { where: { endedAt: null }, take: 1, select: { id: true, startedAt: true } },
      },
    }),
    db.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: (TaskRowData & { status: TaskStatus })[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    done: task.status === "DONE",
    overdue: !!task.dueDate && task.dueDate < todayStart && task.status !== "DONE",
    projectName: task.project?.name,
    dueDate: task.dueDate?.toISOString() ?? null,
    dueTime: task.dueTime,
    runningEntry: task.timeEntries[0]
      ? { id: task.timeEntries[0].id, startedAt: task.timeEntries[0].startedAt.toISOString() }
      : null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filter === "overdue"
            ? "Mostrando tarefas atrasadas"
            : filter === "today"
              ? "Mostrando tarefas de hoje"
              : `${rows.length} tarefas`}
        </p>
        <CreateTaskDialog projects={projects} />
      </div>

      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        <TabsContent value="lista" className="flex flex-col gap-2 pt-3">
          {rows.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma tarefa por aqui.
            </div>
          ) : (
            rows.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </TabsContent>
        <TabsContent value="kanban" className="pt-3">
          <KanbanBoard tasks={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
