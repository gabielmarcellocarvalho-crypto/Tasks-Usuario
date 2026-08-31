"use client";

import { useRef, useState, useTransition } from "react";
import { Star, Copy, Check, Trash2, Pencil, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  toggleFavorite,
  deleteComponent,
  updateComponent,
  getComponentCode,
} from "@/app/(app)/biblioteca/actions";
import { ComponentFormFields } from "@/components/library/component-form-fields";

export type ComponentDTO = {
  id: string;
  name: string;
  description?: string | null;
  kind: "COMPONENT" | "SECTION" | "TEMPLATE";
  category?: string | null;
  technology?: string | null;
  tags: string[];
  favorite: boolean;
  origin?: string | null;
  originUrl?: string | null;
  /** The code itself is fetched on open — see `getComponentCode`. */
  hasCode: boolean;
  language?: string | null;
  version?: string | null;
  previewUrl?: string | null;
  usageCount: number;
};

const KIND_LABEL: Record<ComponentDTO["kind"], string> = {
  COMPONENT: "Componente",
  SECTION: "Seção",
  TEMPLATE: "Template",
};

export function ComponentCard({ component }: { component: ComponentDTO }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [favorite, setFavorite] = useState(component.favorite);
  const [code, setCode] = useState<string | null>(null);
  const [codeStatus, setCodeStatus] = useState<"idle" | "loading" | "ready" | "error">(
    component.hasCode ? "idle" : "ready",
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetched on open rather than shipped with the grid, so a library full of
  // long files costs nothing until a card is actually looked at.
  function openDialog() {
    setOpen(true);
    if (!component.hasCode || codeStatus !== "idle") return;
    setCodeStatus("loading");
    getComponentCode(component.id)
      .then((version) => {
        setCode(version?.code ?? "");
        setCodeStatus("ready");
      })
      .catch(() => setCodeStatus("error"));
  }

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next) {
      setEditing(false);
      setSaveError(null);
    }
  }

  function handleSave(formData: FormData) {
    setSaveError(null);
    startTransition(async () => {
      const result = await updateComponent(formData);
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      // The saved code is now the current version; keep the viewer in sync
      // without another round trip.
      setCode((formData.get("code") as string | null) ?? "");
      setEditing(false);
    });
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="flex flex-col gap-2.5 overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-border/80"
      >
        <div className="flex aspect-video items-center justify-center border-b border-border bg-muted/30">
          {component.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={component.previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[11px] text-muted-foreground">Sem preview</span>
          )}
        </div>
        <div className="flex flex-col gap-2.5 px-3.5 pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-medium">{component.name}</h3>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setFavorite((f) => !f);
              startTransition(async () => { await toggleFavorite(component.id); });
            }}
            className="shrink-0"
          >
            <Star
              className={cn(
                "size-4",
                favorite ? "fill-status-warning text-status-warning" : "text-muted-foreground",
              )}
            />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {KIND_LABEL[component.kind]}
          </Badge>
          {component.technology ? <span>{component.technology}</span> : null}
        </div>
        {component.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {component.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            usado em {component.usageCount} projeto{component.usageCount === 1 ? "" : "s"}
          </span>
          {component.version ? <span className="font-numeric">v{component.version}</span> : null}
        </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-2xl">
          {editing && codeStatus === "ready" ? (
            <>
              <DialogHeader>
                <DialogTitle>Editar componente</DialogTitle>
              </DialogHeader>
              <form
                ref={formRef}
                action={handleSave}
                className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
              >
                <input type="hidden" name="id" value={component.id} />
                <ComponentFormFields
                  idPrefix={`cm-edit-${component.id}`}
                  codeLabel={component.version ? `Código (versão atual: ${component.version})` : "Código"}
                  codeHelp="Alterar o código salva uma nova versão automaticamente — a anterior fica preservada."
                  defaults={{
                    name: component.name,
                    kind: component.kind,
                    category: component.category ?? undefined,
                    technology: component.technology ?? undefined,
                    tags: component.tags.join(", "),
                    description: component.description ?? undefined,
                    origin: component.origin ?? undefined,
                    originUrl: component.originUrl ?? undefined,
                    language: component.language ?? undefined,
                    code: code ?? undefined,
                    previewUrl: component.previewUrl ?? undefined,
                  }}
                />
                {saveError ? (
                  <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {saveError}
                  </p>
                ) : null}
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
            <ComponentViewer
              component={component}
              code={code}
              codeStatus={codeStatus}
              pending={pending}
              onEdit={() => setEditing(true)}
              onDelete={() =>
                startTransition(async () => {
                  await deleteComponent(component.id);
                  setOpen(false);
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Rendering a very long file as one <pre> blocks the main thread while the
 * browser lays out every line. Only the first slice is painted; the rest is
 * one click away, and copy/download always take the whole thing.
 */
const PREVIEW_LINES = 400;

function ComponentViewer({
  component,
  code,
  codeStatus,
  pending,
  onEdit,
  onDelete,
}: {
  component: ComponentDTO;
  code: string | null;
  codeStatus: "idle" | "loading" | "ready" | "error";
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lines = code ? code.split("\n") : [];
  const truncated = !expanded && lines.length > PREVIEW_LINES;
  const shown = truncated ? lines.slice(0, PREVIEW_LINES).join("\n") : code;

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadCode() {
    if (!code) return;
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${component.name.replace(/[^\w.-]+/g, "-")}.${component.language || "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{component.name}</DialogTitle>
        {component.description ? (
          <DialogDescription>{component.description}</DialogDescription>
        ) : null}
      </DialogHeader>

      {component.previewUrl ? (
        <div className="overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={component.previewUrl} alt="" className="max-h-64 w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge variant="outline">{KIND_LABEL[component.kind]}</Badge>
        {component.category ? <Badge variant="outline">{component.category}</Badge> : null}
        {component.technology ? <Badge variant="outline">{component.technology}</Badge> : null}
        {component.version ? (
          <Badge variant="outline" className="font-numeric">
            v{component.version}
          </Badge>
        ) : null}
        {component.tags.map((tag) => (
          <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
            #{tag}
          </span>
        ))}
      </div>

      {component.origin || component.originUrl ? (
        <div className="text-xs text-muted-foreground">
          Origem: {component.origin ?? "—"}
          {component.originUrl ? (
            <a href={component.originUrl} target="_blank" rel="noreferrer" className="ml-1 underline">
              (link)
            </a>
          ) : null}
        </div>
      ) : null}

      {!component.hasCode ? (
        <p className="text-sm text-muted-foreground">Nenhum código salvo para este item.</p>
      ) : codeStatus === "error" ? (
        <p className="text-sm text-destructive">Não foi possível carregar o código.</p>
      ) : codeStatus !== "ready" ? (
        <div className="h-32 animate-pulse rounded-md border border-border bg-muted/40" />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
              <code>{shown}</code>
            </pre>
            <div className="absolute right-2 top-2 flex gap-1.5">
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={copyCode}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={downloadCode}>
                <Download className="size-3.5" />
                Baixar
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-numeric">
              {lines.length} linhas · {(code?.length ?? 0).toLocaleString("pt-BR")} caracteres
            </span>
            {truncated ? (
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={() => setExpanded(true)}
              >
                mostrando as primeiras {PREVIEW_LINES} — mostrar tudo
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={codeStatus === "loading"}
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Remover
        </Button>
      </div>
    </>
  );
}
