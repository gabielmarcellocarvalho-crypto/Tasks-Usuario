"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { PRIORITY_META, STATUS_COLUMNS, STATUS_META } from "@/lib/task-meta";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { updateTaskStatus, deleteTask } from "@/app/(app)/tarefas/actions";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";

type KanbanTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  projectName?: string | null;
  dueDate?: string | null;
};

export function KanbanBoard({
  tasks: initialTasks,
  projects = [],
}: {
  tasks: KanbanTask[];
  projects?: { id: string; name: string }[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Re-sync when the server sends fresh data (after revalidation elsewhere).
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function moveTask(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
    });
  }

  function removeTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(async () => {
      await deleteTask(taskId);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const nextStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== nextStatus) {
      moveTask(String(active.id), nextStatus);
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUS_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onMove={moveTask}
            onDelete={removeTask}
            projects={projects}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} onMove={moveTask} onDelete={removeTask} projects={projects} overlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  tasks,
  onMove,
  onDelete,
  projects,
}: {
  status: TaskStatus;
  tasks: KanbanTask[];
  onMove: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  projects: { id: string; name: string }[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2.5 transition-colors",
        isOver ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card/30",
      )}
    >
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold">{STATUS_META[status].label}</span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onMove={onMove} onDelete={onDelete} projects={projects} />
        ))}
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 px-2 py-4 text-center text-xs text-muted-foreground">
            Solte aqui
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KanbanCard({
  task,
  onMove,
  onDelete,
  projects,
  overlay = false,
}: {
  task: KanbanTask;
  onMove: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  projects: { id: string; name: string }[];
  overlay?: boolean;
}) {
  const priority = PRIORITY_META[task.priority];
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-sm",
        isDragging && !overlay && "opacity-40",
        overlay && "rotate-2 shadow-lg",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Arrastar tarefa"
        >
          <GripVertical className="size-3.5" />
        </button>
        <Link
          href={`/tarefas?task=${task.id}`}
          className="min-w-0 flex-1 truncate hover:underline"
          onClick={(e) => overlay && e.preventDefault()}
        >
          {task.title}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="size-5 shrink-0" />}
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_COLUMNS.map((s) => (
              <DropdownMenuItem
                key={s}
                disabled={s === task.status}
                onClick={() => onMove(task.id, s)}
              >
                Mover para {STATUS_META[s].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Editar tarefa
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="size-3.5" />
              Excluir tarefa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-[10px]", priority.className)}>
          {priority.label}
        </Badge>
        {task.dueDate ? (
          <span className="text-[11px] text-muted-foreground">{formatDate(task.dueDate)}</span>
        ) : null}
      </div>
      {task.projectName ? (
        <span className="truncate text-[11px] text-muted-foreground">{task.projectName}</span>
      ) : null}
      {!overlay ? (
        <EditTaskDialog taskId={task.id} open={editOpen} onOpenChange={setEditOpen} projects={projects} />
      ) : null}
    </div>
  );
}
