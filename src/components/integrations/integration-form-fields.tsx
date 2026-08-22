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
import { INTEGRATION_STATUS_META } from "@/lib/integration-meta";
import type { IntegrationStatus } from "@/generated/prisma/client";

const STATUS_ITEMS = Object.fromEntries(
  Object.entries(INTEGRATION_STATUS_META).map(([key, meta]) => [key, meta.label]),
);

export type IntegrationFormDefaults = {
  name?: string;
  category?: string;
  status?: IntegrationStatus;
  url?: string;
  docsUrl?: string;
  notes?: string;
  projectId?: string;
};

export function IntegrationFormFields({
  idPrefix,
  defaults = {},
  projects,
}: {
  idPrefix: string;
  defaults?: IntegrationFormDefaults;
  projects: { id: string; name: string }[];
}) {
  const id = (suffix: string) => `${idPrefix}-${suffix}`;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("name")}>Nome</Label>
        <Input
          id={id("name")}
          name="name"
          required
          autoFocus
          defaultValue={defaults.name}
          placeholder="OpenAI"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("category")}>Categoria</Label>
          <Input
            id={id("category")}
            name="category"
            placeholder="IA, mensageria…"
            defaultValue={defaults.category}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("status")}>Status</Label>
          <Select name="status" defaultValue={defaults.status ?? "CONNECTED"} items={STATUS_ITEMS}>
            <SelectTrigger id={id("status")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_ITEMS) as IntegrationStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {INTEGRATION_STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("project")}>Projeto</Label>
        <Select
          name="projectId"
          defaultValue={defaults.projectId}
          items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
        >
          <SelectTrigger id={id("project")}>
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("url")}>URL</Label>
        <Input id={id("url")} name="url" placeholder="https://…" defaultValue={defaults.url} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("docs")}>Documentação</Label>
        <Input
          id={id("docs")}
          name="docsUrl"
          placeholder="https://docs…"
          defaultValue={defaults.docsUrl}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("notes")}>Observações</Label>
        <Textarea id={id("notes")} name="notes" rows={2} defaultValue={defaults.notes} />
      </div>
    </>
  );
}
