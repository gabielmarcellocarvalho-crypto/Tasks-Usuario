import type { ProjectStatus } from "@/generated/prisma/client";

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-status-success/15 text-status-success border-status-success/30",
  },
  PAUSED: {
    label: "Pausado",
    className: "bg-status-attention/15 text-status-attention border-status-attention/30",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  ARCHIVED: {
    label: "Arquivado",
    className: "bg-muted text-muted-foreground/60 border-transparent",
  },
};
