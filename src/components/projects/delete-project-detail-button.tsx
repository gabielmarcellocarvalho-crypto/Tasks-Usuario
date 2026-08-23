"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/app/(app)/projetos/actions";

export function DeleteProjectDetailButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      className="gap-1.5 text-destructive hover:text-destructive"
      onClick={() =>
        startTransition(async () => {
          await deleteProject(projectId);
          router.push("/projetos");
        })
      }
    >
      <Trash2 className="size-3.5" />
      Excluir projeto
    </Button>
  );
}
