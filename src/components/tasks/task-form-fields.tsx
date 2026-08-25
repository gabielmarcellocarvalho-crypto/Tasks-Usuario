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
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

export const PRIORITY_ITEMS = { LOW: "Baixa", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente" };
export const STATUS_ITEMS = {
  BACKLOG: "Backlog",
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  WAITING: "Aguardando",
  DONE: "Concluído",
};

export type TaskFormDefaults = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  projectId?: string;
  dueDate?: string;
  dueTime?: string;
  category?: string;
};

export function TaskFormFields({
  idPrefix,
  defaults = {},
  projects,
}: {
  idPrefix: string;
  defaults?: TaskFormDefaults;
  projects: { id: string; name: string }[];
}) {
  const id = (suffix: string) => `${idPrefix}-${suffix}`;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("title")}>Título</Label>
        <Input id={id("title")} name="title" required autoFocus defaultValue={defaults.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("description")}>Descrição</Label>
        <Textarea
          id={id("description")}
          name="description"
          rows={2}
          defaultValue={defaults.description}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("priority")}>Prioridade (urgência)</Label>
          <Select name="priority" defaultValue={defaults.priority ?? "NORMAL"} items={PRIORITY_ITEMS}>
            <SelectTrigger id={id("priority")}>
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
          <Label htmlFor={id("status")}>Status</Label>
          <Select name="status" defaultValue={defaults.status ?? "TODO"} items={STATUS_ITEMS}>
            <SelectTrigger id={id("status")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BACKLOG">Backlog</SelectItem>
              <SelectItem value="TODO">A fazer</SelectItem>
              <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
              <SelectItem value="WAITING">Aguardando</SelectItem>
              <SelectItem value="DONE">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("due")}>Prazo</Label>
          <Input id={id("due")} name="dueDate" type="date" defaultValue={defaults.dueDate} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("time")}>Hora</Label>
          <Input id={id("time")} name="dueTime" type="time" defaultValue={defaults.dueTime} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("category")}>Categoria</Label>
          <Input id={id("category")} name="category" defaultValue={defaults.category} />
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
    </>
  );
}
