import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { relativeTimeFromNow } from "@/lib/format";

export async function HermesStatusPill() {
  const client = await db.apiClient.findFirst({
    where: { active: true },
    orderBy: { lastSeenAt: "desc" },
  });

  const online = !!client?.lastSeenAt && Date.now() - client.lastSeenAt.getTime() < 5 * 60 * 1000;

  return (
    <div className="flex flex-col gap-1 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1.5 text-xs">
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            online ? "bg-status-success" : "bg-status-expired",
          )}
        />
        <span className="font-medium text-sidebar-foreground">
          Hermes {online ? "online" : "offline"}
        </span>
      </div>
      <span className="truncate pl-3 text-[11px] leading-tight text-sidebar-foreground/60">
        {client?.lastSeenAt ? relativeTimeFromNow(client.lastSeenAt) : "nunca conectado"}
      </span>
    </div>
  );
}
