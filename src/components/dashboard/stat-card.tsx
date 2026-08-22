import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "critical" | "warning" | "success";
}) {
  const toneClass = {
    default: "text-foreground",
    critical: "text-status-critical",
    warning: "text-status-attention",
    success: "text-status-success",
  }[tone];

  const content = (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 transition-colors hover:border-border/80">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className={cn("size-4", toneClass)} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className={cn("font-numeric text-xl font-semibold leading-tight tabular-nums", toneClass)}>
          {value}
        </div>
        <div className="truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
