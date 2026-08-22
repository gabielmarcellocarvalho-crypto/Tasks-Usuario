import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Clock,
  FolderKanban,
  TriangleAlert,
} from "lucide-react";
import { db } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { CriticalAlerts } from "@/components/dashboard/critical-alerts";
import { TaskRow, type TaskRowData } from "@/components/tasks/task-row";
import { getCriticalAlerts } from "@/lib/alerts";
import { startOfDay, endOfDay, formatDuration } from "@/lib/format";

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    overdueCount,
    dueTodayCount,
    upcomingDeadlinesCount,
    activeProjectsCount,
    todayEntries,
    myDayTasks,
    alerts,
  ] = await Promise.all([
    db.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: todayStart } } }),
    db.task.count({
      where: { status: { not: "DONE" }, dueDate: { gte: todayStart, lte: todayEnd } },
    }),
    db.deadline.count({ where: { dueAt: { gte: now, lte: in7Days } } }),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.timeEntry.findMany({
      where: { startedAt: { gte: todayStart } },
      select: { startedAt: true, endedAt: true, durationSeconds: true },
    }),
    db.task.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { lte: todayEnd },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 12,
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        dueTime: true,
        project: { select: { name: true } },
        timeEntries: { where: { endedAt: null }, take: 1, select: { id: true, startedAt: true } },
      },
    }),
    getCriticalAlerts(),
  ]);

  const secondsToday = todayEntries.reduce((sum, entry) => {
    if (entry.durationSeconds != null) return sum + entry.durationSeconds;
    if (!entry.endedAt) return sum + Math.floor((now.getTime() - entry.startedAt.getTime()) / 1000);
    return sum;
  }, 0);

  const myDay: TaskRowData[] = myDayTasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    done: false,
    overdue: !!task.dueDate && task.dueDate < todayStart,
    projectName: task.project?.name,
    dueDate: task.dueDate?.toISOString() ?? null,
    dueTime: task.dueTime,
    runningEntry: task.timeEntries[0]
      ? { id: task.timeEntries[0].id, startedAt: task.timeEntries[0].startedAt.toISOString() }
      : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Tarefas atrasadas"
          value={overdueCount}
          icon={AlertCircle}
          href="/tarefas?filter=overdue"
          tone={overdueCount > 0 ? "critical" : "default"}
        />
        <StatCard
          label="Tarefas de hoje"
          value={dueTodayCount}
          icon={CalendarDays}
          href="/tarefas?filter=today"
        />
        <StatCard
          label="Próximos prazos"
          value={upcomingDeadlinesCount}
          icon={CalendarClock}
          href="/monitor"
          tone={upcomingDeadlinesCount > 0 ? "warning" : "default"}
        />
        <StatCard label="Projetos ativos" value={activeProjectsCount} icon={FolderKanban} href="/projetos" />
        <StatCard label="Tempo de hoje" value={formatDuration(secondsToday)} icon={Clock} />
        <StatCard
          label="Alertas"
          value={alerts.length}
          icon={TriangleAlert}
          tone={alerts.length > 0 ? "critical" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Meu dia</h2>
            <span className="text-xs text-muted-foreground">{myDay.length} tarefas</span>
          </div>
          {myDay.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma tarefa para hoje. Aproveite ou adiante algo do backlog.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myDay.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Alertas críticos</h2>
          </div>
          <CriticalAlerts items={alerts} />
        </section>
      </div>
    </div>
  );
}
