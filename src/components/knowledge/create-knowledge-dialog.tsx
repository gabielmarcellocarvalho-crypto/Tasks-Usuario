"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { createKnowledgeItem } from "@/app/(app)/conhecimento/actions";
import { KNOWLEDGE_TYPES, KNOWLEDGE_TYPE_LABEL } from "@/lib/knowledge-meta";

export function CreateKnowledgeDialog({ projects }: { projects: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createKnowledgeItem(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Novo documento
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo documento</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kn-title">Título</Label>
            <Input id="kn-title" name="title" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kn-type">Tipo</Label>
              <Select name="type" defaultValue="NOTE" items={KNOWLEDGE_TYPE_LABEL}>
                <SelectTrigger id="kn-type">
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
              <Label htmlFor="kn-project">Projeto</Label>
              <Select
                name="projectId"
                items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
              >
                <SelectTrigger id="kn-project">
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
            <Label htmlFor="kn-tags">Tags (separadas por vírgula)</Label>
            <Input id="kn-tags" name="tags" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kn-content">Conteúdo (Markdown)</Label>
            <Textarea id="kn-content" name="content" rows={8} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
