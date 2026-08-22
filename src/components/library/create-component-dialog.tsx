"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createComponent } from "@/app/(app)/biblioteca/actions";
import { ComponentFormFields } from "@/components/library/component-form-fields";

export function CreateComponentDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createComponent(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Novo componente
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo componente</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
        >
          <ComponentFormFields idPrefix="cm-new" codeLabel="Código (versão 1.0)" />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar componente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
