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
import { DEADLINE_TYPES, DEADLINE_TYPE_LABEL } from "@/lib/deadline-meta";
import type { DeadlineType } from "@/generated/prisma/client";

export type DeadlineFormDefaults = {
  name?: string;
  type?: DeadlineType;
  dueDate?: string;
  dueTime?: string;
  url?: string;
  responsible?: string;
  periodicity?: string;
  notes?: string;
  projectId?: string;
};

export function DeadlineFormFields({
  idPrefix,
  defaults = {},
  projects,
}: {
  idPrefix: string;
  defaults?: DeadlineFormDefaults;
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
          placeholder="API OpenAI"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("type")}>Tipo</Label>
          <Select name="type" defaultValue={defaults.type ?? "OTHER"} items={DEADLINE_TYPE_LABEL}>
            <SelectTrigger id={id("type")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEADLINE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {DEADLINE_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("date")}>Vence em</Label>
          <Input id={id("date")} name="dueDate" type="date" required defaultValue={defaults.dueDate} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("time")}>Hora</Label>
          <Input id={id("time")} name="dueTime" type="time" defaultValue={defaults.dueTime} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("url")}>URL</Label>
        <Input id={id("url")} name="url" placeholder="https://…" defaultValue={defaults.url} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("responsible")}>Responsável</Label>
          <Input id={id("responsible")} name="responsible" defaultValue={defaults.responsible} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("periodicity")}>Periodicidade</Label>
          <Input
            id={id("periodicity")}
            name="periodicity"
            placeholder="anual, mensal…"
            defaultValue={defaults.periodicity}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("notes")}>Observações</Label>
        <Textarea id={id("notes")} name="notes" rows={2} defaultValue={defaults.notes} />
      </div>
    </>
  );
}
