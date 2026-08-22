"use client";

import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUS_META } from "@/lib/project-meta";
import type { ProjectStatus } from "@/generated/prisma/client";
import { updateProjectStatus } from "@/app/(app)/projetos/actions";

const OPTIONS: ProjectStatus[] = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

export function ProjectStatusMenu({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
        disabled={pending}
      >
        Alterar status
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={status === currentStatus}
            onClick={() =>
              startTransition(async () => {
                await updateProjectStatus(projectId, status);
              })
            }
          >
            {PROJECT_STATUS_META[status].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
