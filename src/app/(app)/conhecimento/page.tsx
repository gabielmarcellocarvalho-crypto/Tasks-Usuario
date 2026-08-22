import { db } from "@/lib/db";
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog";
import { KnowledgeItemRow } from "@/components/knowledge/knowledge-item-row";

export default async function ConhecimentoPage() {
  const [items, projects] = await Promise.all([
    db.knowledgeItem.findMany({
      orderBy: { updatedAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
    db.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} documentos</p>
        <CreateKnowledgeDialog projects={projects} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum documento ainda. Guarde processos, prompts e anotações aqui.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <KnowledgeItemRow
              key={item.id}
              projects={projects}
              item={{
                id: item.id,
                title: item.title,
                content: item.content,
                type: item.type,
                tags: JSON.parse(item.tags || "[]"),
                projectId: item.projectId,
                projectName: item.project?.name,
                updatedAt: item.updatedAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
