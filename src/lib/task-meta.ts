import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

export const PRIORITY_META: Record<TaskPriority, { label: string; className: string }> = {
  LOW: { label: "Baixa", className: "bg-muted text-muted-foreground border-transparent" },
  NORMAL: { label: "Normal", className: "bg-secondary text-secondary-foreground border-transparent" },
  HIGH: {
    label: "Alta",
    className: "bg-status-warning/15 text-status-warning border-status-warning/30",
  },
  URGENT: {
    label: "Urgente",
    className: "bg-status-critical/15 text-status-critical border-status-critical/30",
  },
};

export const STATUS_META: Record<TaskStatus, { label: string }> = {
  BACKLOG: { label: "Backlog" },
  TODO: { label: "A fazer" },
  IN_PROGRESS: { label: "Em andamento" },
  WAITING: { label: "Aguardando" },
  DONE: { label: "Concluído" },
};

export const STATUS_COLUMNS: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "WAITING",
  "DONE",
];
