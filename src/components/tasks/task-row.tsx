"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Play, Square, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatClock, formatDate } from "@/lib/format";
import { PRIORITY_META } from "@/lib/task-meta";
import type { TaskPriority } from "@/generated/prisma/client";
import { toggleTaskDone, startTimer, stopTimer, deleteTask } from "@/app/(app)/tarefas/actions";

export type TaskRowData = {
  id: string;
  title: string;
  priority: TaskPriority;
  done: boolean;
  overdue: boolean;
  projectName?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  runningEntry: { id: string; startedAt: string } | null;
};

export function TaskRow({ task }: { task: TaskRowData }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(task.done);
  const priority = PRIORITY_META[task.priority];

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-card/50 px-3 py-2.5 transition-colors hover:bg-card">
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex shrink-0 p-0.5" />}>
          <Checkbox
            checked={done}
            disabled={pending}
            className="size-[18px]"
            onCheckedChange={() => {
              setDone((d) => !d);
              startTransition(async () => {
                await toggleTaskDone(task.id);
              });
            }}
          />
        </TooltipTrigger>
        <TooltipContent>{done ? "Marcar como pendente" : "Concluir tarefa"}</TooltipContent>
      </Tooltip>

      <div className="min-w-0 flex-1">
        <Link
          href={`/tarefas?task=${task.id}`}
          className={cn(
            "block truncate text-sm font-medium hover:underline",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {task.projectName ? <span>{task.projectName}</span> : null}
          {task.dueDate ? (
            <span className={cn(task.overdue && !done && "text-status-critical")}>
              {formatDate(task.dueDate)}
              {task.dueTime ? ` • ${task.dueTime}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      <Badge variant="outline" className={cn("shrink-0 text-[11px]", priority.className)}>
        {priority.label}
      </Badge>

      <TimerButton taskId={task.id} runningEntry={task.runningEntry} disabled={done} />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              className="shrink-0"
              onClick={() => startTransition(async () => { await deleteTask(task.id); })}
            />
          }
        >
          <Trash2 className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>Excluir tarefa</TooltipContent>
      </Tooltip>
    </div>
  );
}

function TimerButton({
  taskId,
  runningEntry,
  disabled,
}: {
  taskId: string;
  runningEntry: { id: string; startedAt: string } | null;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!runningEntry) return;
    function tick() {
      setElapsed(
        Math.floor((Date.now() - new Date(runningEntry!.startedAt).getTime()) / 1000),
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [runningEntry]);

  if (runningEntry) {
    return (
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        className="shrink-0 gap-1.5 font-numeric tabular-nums"
        onClick={() =>
          startTransition(async () => {
            await stopTimer(runningEntry.id);
          })
        }
      >
        <Square className="size-3.5 fill-current" />
        {formatClock(elapsed)}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending || disabled}
      className="shrink-0 gap-1.5"
      onClick={() =>
        startTransition(async () => {
          await startTimer(taskId);
        })
      }
    >
      <Play className="size-3.5" />
      Iniciar
    </Button>
  );
}
