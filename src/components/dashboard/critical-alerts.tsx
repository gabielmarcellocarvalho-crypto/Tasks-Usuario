import Link from "next/link";
import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/lib/alerts";

const LEVEL_META = {
  critical: { icon: AlertOctagon, className: "text-status-critical" },
  attention: { icon: AlertTriangle, className: "text-status-attention" },
  warning: { icon: Info, className: "text-status-warning" },
} as const;

export function CriticalAlerts({ items }: { items: AlertItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        Nenhum alerta no momento. Tudo sob controle.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {items.slice(0, 8).map((item) => {
        const meta = LEVEL_META[item.level];
        const Icon = meta.icon;
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-2.5 rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm transition-colors hover:bg-card"
            >
              <Icon className={cn("size-4 shrink-0", meta.className)} strokeWidth={2} />
              <span className="truncate">{item.message}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
