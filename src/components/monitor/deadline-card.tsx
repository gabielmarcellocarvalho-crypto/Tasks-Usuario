"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { countdownParts, formatDateFull } from "@/lib/format";
import { classifyDeadline, DEADLINE_LEVEL_META } from "@/lib/status";
import { DEADLINE_TYPE_LABEL } from "@/lib/deadline-meta";
import type { DeadlineType } from "@/generated/prisma/client";
import { deleteDeadline, updateDeadline } from "@/app/(app)/monitor/actions";
import { DeadlineFormFields } from "@/components/monitor/deadline-form-fields";

export type DeadlineDTO = {
  id: string;
  name: string;
  type: DeadlineType;
  dueAt: string;
  url?: string | null;
  responsible?: string | null;
  notes?: string | null;
  periodicity?: string | null;
  projectId?: string | null;
  projectName?: string | null;
};

export function DeadlineCard({
  deadline,
  projects,
}: {
  deadline: DeadlineDTO;
  projects: { id: string; name: string }[];
}) {
  const [, forceTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const level = classifyDeadline(deadline.dueAt);
  const meta = DEADLINE_LEVEL_META[level];
  const { expired, days, hours, minutes } = countdownParts(deadline.dueAt);

  const due = new Date(deadline.dueAt);
  const dueDate = due.toISOString().slice(0, 10);
  const dueTime = due.toTimeString().slice(0, 5);

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next) setEditing(false);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateDeadline(formData);
      setEditing(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-border/80"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
            <h3 className="truncate text-sm font-medium">{deadline.name}</h3>
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label="Excluir prazo"
            onClick={(e) => {
              e.stopPropagation();
              startTransition(async () => {
                await deleteDeadline(deadline.id);
              });
            }}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {DEADLINE_TYPE_LABEL[deadline.type]}
          </Badge>
          {deadline.projectName ? (
            <span className="text-xs text-muted-foreground">{deadline.projectName}</span>
          ) : null}
        </div>

        <div
          className={cn(
            "rounded-md border px-2.5 py-1.5 font-numeric text-xs font-medium tabular-nums",
            meta.badgeClass,
          )}
        >
          {expired
            ? `Expirado há ${days}d`
            : days > 0
              ? `Expira em ${days}d ${hours}h`
              : `Expira em ${hours}h ${minutes}m`}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDateFull(deadline.dueAt)}</span>
          {deadline.url ? (
            <a
              href={deadline.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Link <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </button>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          {editing ? (
            <>
              <DialogHeader>
                <DialogTitle>Editar prazo</DialogTitle>
              </DialogHeader>
              <form ref={formRef} action={handleSave} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={deadline.id} />
                <DeadlineFormFields
                  idPrefix={`dl-edit-${deadline.id}`}
                  projects={projects}
                  defaults={{
                    name: deadline.name,
                    type: deadline.type,
                    dueDate,
                    dueTime,
                    url: deadline.url ?? undefined,
                    responsible: deadline.responsible ?? undefined,
                    periodicity: deadline.periodicity ?? undefined,
                    notes: deadline.notes ?? undefined,
                    projectId: deadline.projectId ?? undefined,
                  }}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Salvando…" : "Salvar alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{deadline.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge variant="outline">{DEADLINE_TYPE_LABEL[deadline.type]}</Badge>
                {deadline.projectName ? (
                  <span className="text-muted-foreground">{deadline.projectName}</span>
                ) : null}
              </div>
              <div className={cn("rounded-md border px-3 py-2 font-numeric text-sm font-medium", meta.badgeClass)}>
                {expired
                  ? `Expirado há ${days}d ${hours}h`
                  : `Expira em ${days}d ${hours}h ${minutes}m`}
                <div className="mt-0.5 text-xs font-normal opacity-80">
                  {formatDateFull(deadline.dueAt)}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                {deadline.responsible ? (
                  <>
                    <dt className="text-muted-foreground">Responsável</dt>
                    <dd>{deadline.responsible}</dd>
                  </>
                ) : null}
                {deadline.periodicity ? (
                  <>
                    <dt className="text-muted-foreground">Periodicidade</dt>
                    <dd>{deadline.periodicity}</dd>
                  </>
                ) : null}
                {deadline.url ? (
                  <>
                    <dt className="text-muted-foreground">URL</dt>
                    <dd className="truncate">
                      <a href={deadline.url} target="_blank" rel="noreferrer" className="underline">
                        {deadline.url}
                      </a>
                    </dd>
                  </>
                ) : null}
              </dl>
              {deadline.notes ? (
                <p className="rounded-md border border-border bg-muted/30 p-2.5 text-sm text-muted-foreground">
                  {deadline.notes}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteDeadline(deadline.id);
                      setOpen(false);
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                  Remover
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
