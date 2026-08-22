"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateFull } from "@/lib/format";
import { KNOWLEDGE_TYPE_LABEL, KNOWLEDGE_TYPES } from "@/lib/knowledge-meta";
import type { KnowledgeType } from "@/generated/prisma/client";
import { deleteKnowledgeItem, updateKnowledgeItem } from "@/app/(app)/conhecimento/actions";
import { MarkdownContent } from "@/components/knowledge/markdown-content";

export type KnowledgeDTO = {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  projectId?: string | null;
  projectName?: string | null;
  updatedAt: string;
};

export function KnowledgeItemRow({
  item,
  projects,
}: {
  item: KnowledgeDTO;
  projects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next) setEditing(false);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateKnowledgeItem(formData);
      setEditing(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-border/80"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-medium">{item.title}</h3>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {KNOWLEDGE_TYPE_LABEL[item.type]}
          </Badge>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {item.content || "Sem conteúdo ainda."}
        </p>
        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{item.projectName ?? "Sem projeto"}</span>
          <span>{formatDateFull(item.updatedAt)}</span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-xl">
          {editing ? (
            <>
              <DialogHeader>
                <DialogTitle>Editar documento</DialogTitle>
              </DialogHeader>
              <form
                ref={formRef}
                action={handleSave}
                className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
              >
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`kn-edit-title-${item.id}`}>Título</Label>
                  <Input id={`kn-edit-title-${item.id}`} name="title" defaultValue={item.title} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`kn-edit-type-${item.id}`}>Tipo</Label>
                    <Select name="type" defaultValue={item.type} items={KNOWLEDGE_TYPE_LABEL}>
                      <SelectTrigger id={`kn-edit-type-${item.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KNOWLEDGE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {KNOWLEDGE_TYPE_LABEL[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`kn-edit-project-${item.id}`}>Projeto</Label>
                    <Select
                      name="projectId"
                      defaultValue={item.projectId ?? undefined}
                      items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
                    >
                      <SelectTrigger id={`kn-edit-project-${item.id}`}>
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`kn-edit-tags-${item.id}`}>Tags (separadas por vírgula)</Label>
                  <Input
                    id={`kn-edit-tags-${item.id}`}
                    name="tags"
                    defaultValue={item.tags.join(", ")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`kn-edit-content-${item.id}`}>Conteúdo (Markdown)</Label>
                  <Textarea
                    id={`kn-edit-content-${item.id}`}
                    name="content"
                    defaultValue={item.content}
                    rows={10}
                    className="font-mono text-xs"
                  />
                </div>
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
                <DialogTitle>{item.title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge variant="outline">{KNOWLEDGE_TYPE_LABEL[item.type]}</Badge>
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="max-h-96 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
                <MarkdownContent content={item.content} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditing(true)}
                >
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
                      await deleteKnowledgeItem(item.id);
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
