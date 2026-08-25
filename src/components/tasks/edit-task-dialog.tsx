"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTaskById, updateTask } from "@/app/(app)/tarefas/actions";
import { TaskFormFields, type TaskFormDefaults } from "@/components/tasks/task-form-fields";

export function EditTaskDialog({
  taskId,
  open,
  onOpenChange,
  projects,
}: {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [defaults, setDefaults] = useState<TaskFormDefaults | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) {
      setDefaults(null);
      return;
    }
    getTaskById(taskId).then((task) => {
      setDefaults({
        title: task.title,
        description: task.description ?? undefined,
        priority: task.priority,
        status: task.status,
        projectId: task.projectId ?? undefined,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : undefined,
        dueTime: task.dueTime ?? undefined,
        category: task.category ?? undefined,
      });
    });
  }, [open, taskId]);

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateTask(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>
        {defaults ? (
          <form ref={formRef} action={handleSave} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={taskId} />
            <TaskFormFields idPrefix={`et-${taskId}`} projects={projects} defaults={defaults} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
