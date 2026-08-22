import {
  CheckCircle2,
  CircleDot,
  FolderPlus,
  Puzzle,
  Plug,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDateFull, formatTime } from "@/lib/format";

const TYPE_ICON: Record<string, LucideIcon> = {
  "task.created": CircleDot,
  "task.completed": CheckCircle2,
  "task.updated": CircleDot,
  "project.created": FolderPlus,
  "component.created": Puzzle,
  "integration.created": Plug,
  "deadline.created": CalendarClock,
};

export type ActivityItemDTO = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
};

export function ActivityList({ items }: { items: ActivityItemDTO[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  const groups = groupByDay(items);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([day, dayItems]) => (
        <div key={day} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">{day}</span>
          <ul className="flex flex-col gap-1 border-l border-border pl-4">
            {dayItems.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? Sparkles;
              return (
                <li key={item.id} className="relative flex items-start gap-2.5 py-1.5">
                  <Icon className="absolute -left-[21px] top-2 size-3.5 rounded-full bg-background text-muted-foreground" />
                  <span className="w-12 shrink-0 pt-px text-xs tabular-nums text-muted-foreground">
                    {formatTime(item.createdAt)}
                  </span>
                  <span className="text-sm">{item.title}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function groupByDay(items: ActivityItemDTO[]): [string, ActivityItemDTO[]][] {
  const map = new Map<string, ActivityItemDTO[]>();
  const today = new Date();
  for (const item of items) {
    const date = new Date(item.createdAt);
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    const key = isToday ? "Hoje" : formatDateFull(date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
}
