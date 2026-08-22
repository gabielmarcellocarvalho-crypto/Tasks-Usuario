"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resetDemoData, wipeAllData } from "@/app/(app)/configuracoes/actions";

export function DangerZone() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div>
        <h2 className="text-sm font-semibold text-destructive">Zona de risco</h2>
        <p className="text-xs text-muted-foreground">
          Estas ações afetam todos os dados salvos localmente. Não há confirmação adicional além
          deste botão — use com cuidado.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await resetDemoData();
              setMessage("Dados de demonstração recarregados.");
            })
          }
        >
          Recarregar dados de demonstração
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          className="text-destructive hover:text-destructive"
          onClick={() =>
            startTransition(async () => {
              await wipeAllData();
              setMessage("Todos os dados foram apagados.");
            })
          }
        >
          Apagar todos os dados
        </Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
