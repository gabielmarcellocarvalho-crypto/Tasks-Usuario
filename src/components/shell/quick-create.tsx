"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTask } from "@/app/(app)/tarefas/actions";

const QUICK_LINKS = [
  { label: "Novo projeto", href: "/projetos?create=1" },
  { label: "Novo prazo", href: "/monitor?create=1" },
  { label: "Nova integração", href: "/integracoes?create=1" },
  { label: "Novo componente", href: "/biblioteca?create=1" },
  { label: "Novo documento", href: "/conhecimento?create=1" },
];

export function QuickCreate() {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (e.key.toLowerCase() === "c" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTaskDialogOpen(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" className="gap-1.5" />}>
          <Plus className="size-4" />
          Criar
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setTaskDialogOpen(true)}>
            Nova tarefa
            <span className="ml-auto text-xs text-muted-foreground">C</span>
          </DropdownMenuItem>
          {QUICK_LINKS.map((link) => (
            <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
              {link.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <QuickTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
    </>
  );
}

function QuickTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      formRef.current?.reset();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
          <DialogDescription>
            Só o título é obrigatório — o resto você ajusta depois.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qc-title">Título</Label>
            <Input id="qc-title" name="title" required autoFocus placeholder="Revisar campanha" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qc-notes">Notas</Label>
            <Textarea id="qc-notes" name="description" placeholder="Opcional" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-priority">Prioridade</Label>
              <Select
                name="priority"
                defaultValue="NORMAL"
                items={{ LOW: "Baixa", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente" }}
              >
                <SelectTrigger id="qc-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-due">Prazo</Label>
              <Input id="qc-due" name="dueDate" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando…" : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
