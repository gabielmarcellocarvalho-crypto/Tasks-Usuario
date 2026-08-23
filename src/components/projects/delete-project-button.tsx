"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteProject } from "@/app/(app)/projetos/actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="secondary"
            size="icon-sm"
            disabled={pending}
            className="opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startTransition(async () => {
                await deleteProject(projectId);
              });
            }}
          />
        }
      >
        <Trash2 className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent>Excluir projeto</TooltipContent>
    </Tooltip>
  );
}
