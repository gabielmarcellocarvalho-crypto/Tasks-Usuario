"use client";

import { useRef, useState, useTransition } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { relativeTimeFromNow } from "@/lib/format";
import { INTEGRATION_STATUS_META } from "@/lib/integration-meta";
import type { IntegrationStatus } from "@/generated/prisma/client";
import {
  deleteIntegration,
  updateIntegration,
  updateIntegrationStatus,
} from "@/app/(app)/integracoes/actions";
import { IntegrationFormFields } from "@/components/integrations/integration-form-fields";

export type IntegrationDTO = {
  id: string;
  name: string;
  category?: string | null;
  status: IntegrationStatus;
  url?: string | null;
  docsUrl?: string | null;
  notes?: string | null;
  lastSyncAt?: string | null;
  projectId?: string | null;
  projectName?: string | null;
};

const STATUS_OPTIONS: IntegrationStatus[] = ["CONNECTED", "ATTENTION", "ERROR", "DISABLED"];

export function IntegrationCard({
  integration,
  projects,
}: {
  integration: IntegrationDTO;
  projects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const meta = INTEGRATION_STATUS_META[integration.status];

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next) setEditing(false);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateIntegration(formData);
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-2 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
            <h3 className="truncate text-sm font-medium">{integration.name}</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {integration.category ? (
            <span className="text-xs text-muted-foreground">{integration.category}</span>
          ) : null}
          {integration.projectName ? (
            <span className="text-xs text-muted-foreground">· {integration.projectName}</span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "w-fit rounded-md border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80",
                  meta.className,
                )}
              />
            }
            disabled={pending}
          >
            {meta.label}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === integration.status}
                onClick={() =>
                  startTransition(async () => {
                    await updateIntegrationStatus(integration.id, status);
                  })
                }
              >
                {INTEGRATION_STATUS_META[status].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          role="button"
          tabIndex={0}
          aria-label="Excluir integração"
          onClick={() => startTransition(async () => { await deleteIntegration(integration.id); })}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Trash2 className="size-3.5" />
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {integration.lastSyncAt
            ? `Sincronizado ${relativeTimeFromNow(integration.lastSyncAt)}`
            : "Nunca sincronizado"}
        </span>
        {integration.url ? (
          <a
            href={integration.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            Link <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          {editing ? (
            <>
              <DialogHeader>
                <DialogTitle>Editar integração</DialogTitle>
              </DialogHeader>
              <form ref={formRef} action={handleSave} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={integration.id} />
                <IntegrationFormFields
                  idPrefix={`in-edit-${integration.id}`}
                  projects={projects}
                  defaults={{
                    name: integration.name,
                    category: integration.category ?? undefined,
                    status: integration.status,
                    url: integration.url ?? undefined,
                    docsUrl: integration.docsUrl ?? undefined,
                    notes: integration.notes ?? undefined,
                    projectId: integration.projectId ?? undefined,
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
                <DialogTitle>{integration.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge variant="outline" className={meta.className}>
                  {meta.label}
                </Badge>
                {integration.category ? <Badge variant="outline">{integration.category}</Badge> : null}
                {integration.projectName ? (
                  <span className="text-muted-foreground">{integration.projectName}</span>
                ) : null}
              </div>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                {integration.url ? (
                  <>
                    <dt className="text-muted-foreground">URL</dt>
                    <dd className="truncate">
                      <a href={integration.url} target="_blank" rel="noreferrer" className="underline">
                        {integration.url}
                      </a>
                    </dd>
                  </>
                ) : null}
                {integration.docsUrl ? (
                  <>
                    <dt className="text-muted-foreground">Documentação</dt>
                    <dd className="truncate">
                      <a href={integration.docsUrl} target="_blank" rel="noreferrer" className="underline">
                        {integration.docsUrl}
                      </a>
                    </dd>
                  </>
                ) : null}
              </dl>
              {integration.notes ? (
                <p className="rounded-md border border-border bg-muted/30 p-2.5 text-sm text-muted-foreground">
                  {integration.notes}
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
                      await deleteIntegration(integration.id);
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
    </div>
  );
}
