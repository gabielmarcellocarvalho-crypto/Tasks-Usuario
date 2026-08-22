import { db } from "@/lib/db";
import { classifyDeadline, PROJECT_STALLED_DAYS } from "@/lib/status";

export type AlertLevel = "critical" | "attention" | "warning";

export type AlertItem = {
  id: string;
  level: AlertLevel;
  message: string;
  href: string;
};

/**
 * Central "what needs my attention" feed. Backs the dashboard's critical
 * alerts panel and the Alertas stat card, and is meant to be the same feed
 * exposed to Hermes later (GET /api/v1/alerts) — one definition of "urgent"
 * for the whole ecosystem instead of the dashboard and the API drifting.
 */
export async function getCriticalAlerts(): Promise<AlertItem[]> {
  const now = new Date();

  const [overdueTasks, openDeadlines, unhealthyIntegrations, activeProjects] = await Promise.all([
    db.task.findMany({
      where: { status: { not: "DONE" }, dueDate: { lt: now } },
      orderBy: { dueDate: "asc" },
      take: 10,
      select: { id: true, title: true, dueDate: true },
    }),
    db.deadline.findMany({
      select: { id: true, name: true, dueAt: true },
    }),
    db.integration.findMany({
      where: { status: { in: ["ERROR", "ATTENTION"] } },
      select: { id: true, name: true, status: true },
    }),
    db.project.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        activities: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    }),
  ]);

  const items: AlertItem[] = [];

  for (const task of overdueTasks) {
    items.push({
      id: `task-${task.id}`,
      level: "critical",
      message: `Tarefa atrasada: "${task.title}"`,
      href: `/tarefas?task=${task.id}`,
    });
  }

  for (const deadline of openDeadlines) {
    const level = classifyDeadline(deadline.dueAt);
    if (level === "expired" || level === "critical") {
      items.push({
        id: `deadline-${deadline.id}`,
        level: "critical",
        message: `${deadline.name} ${level === "expired" ? "expirou" : "expira em breve"}`,
        href: `/monitor?deadline=${deadline.id}`,
      });
    } else if (level === "attention") {
      items.push({
        id: `deadline-${deadline.id}`,
        level: "attention",
        message: `${deadline.name} vence em poucos dias`,
        href: `/monitor?deadline=${deadline.id}`,
      });
    }
  }

  for (const integration of unhealthyIntegrations) {
    items.push({
      id: `integration-${integration.id}`,
      level: integration.status === "ERROR" ? "critical" : "attention",
      message:
        integration.status === "ERROR"
          ? `Integração ${integration.name} com erro`
          : `Integração ${integration.name} precisa de atenção`,
      href: `/integracoes?integration=${integration.id}`,
    });
  }

  const stallMs = PROJECT_STALLED_DAYS * 24 * 60 * 60 * 1000;
  for (const project of activeProjects) {
    const lastActivity = project.activities[0]?.createdAt;
    if (!lastActivity) continue;
    if (now.getTime() - lastActivity.getTime() > stallMs) {
      const days = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));
      items.push({
        id: `project-${project.id}`,
        level: "warning",
        message: `Projeto "${project.name}" sem atividade há ${days} dias`,
        href: `/projetos/${project.id}`,
      });
    }
  }

  const order: Record<AlertLevel, number> = { critical: 0, attention: 1, warning: 2 };
  return items.sort((a, b) => order[a.level] - order[b.level]);
}
