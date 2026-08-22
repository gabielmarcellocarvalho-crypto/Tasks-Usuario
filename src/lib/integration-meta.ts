import type { IntegrationStatus } from "@/generated/prisma/client";

export const INTEGRATION_STATUS_META: Record<
  IntegrationStatus,
  { label: string; dot: string; className: string }
> = {
  CONNECTED: {
    label: "Conectado",
    dot: "bg-status-success",
    className: "bg-status-success/15 text-status-success border-status-success/30",
  },
  ATTENTION: {
    label: "Atenção",
    dot: "bg-status-attention",
    className: "bg-status-attention/15 text-status-attention border-status-attention/30",
  },
  ERROR: {
    label: "Erro",
    dot: "bg-status-critical",
    className: "bg-status-critical/15 text-status-critical border-status-critical/30",
  },
  DISABLED: {
    label: "Desativado",
    dot: "bg-muted-foreground",
    className: "bg-muted text-muted-foreground border-transparent",
  },
};
