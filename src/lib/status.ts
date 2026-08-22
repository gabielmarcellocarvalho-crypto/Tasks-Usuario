// Deadline classification thresholds (days remaining). Configurable in one place
// per spec section 15 ("as regras de classificação devem ser configuráveis").
export const DEADLINE_THRESHOLDS = {
  attentionDays: 7,
  upcomingDays: 14,
} as const;

export type DeadlineLevel =
  | "expired"
  | "critical"
  | "attention"
  | "upcoming"
  | "normal";

export function classifyDeadline(dueAt: Date | string): DeadlineLevel {
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays <= 1) return "critical";
  if (diffDays <= DEADLINE_THRESHOLDS.attentionDays) return "attention";
  if (diffDays <= DEADLINE_THRESHOLDS.upcomingDays) return "upcoming";
  return "normal";
}

export const DEADLINE_LEVEL_META: Record<
  DeadlineLevel,
  { label: string; dot: string; badgeClass: string }
> = {
  expired: {
    label: "Expirado",
    dot: "bg-status-expired",
    badgeClass: "bg-status-expired/15 text-status-expired border-status-expired/30",
  },
  critical: {
    label: "Crítico",
    dot: "bg-status-critical",
    badgeClass: "bg-status-critical/15 text-status-critical border-status-critical/30",
  },
  attention: {
    label: "Atenção",
    dot: "bg-status-attention",
    badgeClass: "bg-status-attention/15 text-status-attention border-status-attention/30",
  },
  upcoming: {
    label: "Próximo",
    dot: "bg-status-warning",
    badgeClass: "bg-status-warning/15 text-status-warning border-status-warning/30",
  },
  normal: {
    label: "Normal",
    dot: "bg-status-success",
    badgeClass: "bg-status-success/15 text-status-success border-status-success/30",
  },
};

export const PROJECT_STALLED_DAYS = 5;
