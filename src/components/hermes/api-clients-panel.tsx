"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { relativeTimeFromNow } from "@/lib/format";
import { createApiClient, revokeApiClient } from "@/app/(app)/hermes/actions";

export type ApiClientDTO = {
  id: string;
  name: string;
  active: boolean;
  lastSeenAt: string | null;
  createdAt: string;
};

export function ApiClientsPanel({ clients }: { clients: ApiClientDTO[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createApiClient(name.trim());
      setToken(result.token);
    });
  }

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setToken(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Clientes de API</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Novo token
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhum token gerado ainda. Crie um para conectar o Hermes.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className={client.active ? "" : "text-muted-foreground line-through"}>
                  {client.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {client.lastSeenAt
                    ? `Visto ${relativeTimeFromNow(client.lastSeenAt)}`
                    : "Nunca usado"}
                </span>
              </div>
              {client.active ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => startTransition(async () => { await revokeApiClient(client.id); })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">revogado</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo token de API</DialogTitle>
            <DialogDescription>
              Use este token no header <code>Authorization: Bearer …</code> das requisições do
              Hermes.
            </DialogDescription>
          </DialogHeader>

          {token ? (
            <TokenReveal token={token} />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ac-name">Nome do cliente</Label>
                <Input
                  id="ac-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hermes"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={pending || !name.trim()}>
                  {pending ? "Gerando…" : "Gerar token"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TokenReveal({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-status-attention">
        Copie agora — este token não será mostrado novamente.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
          {token}
        </code>
        <Button size="sm" variant="secondary" onClick={copy} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
