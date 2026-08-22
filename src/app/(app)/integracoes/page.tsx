import { db } from "@/lib/db";
import { CreateIntegrationDialog } from "@/components/integrations/create-integration-dialog";
import { IntegrationCard } from "@/components/integrations/integration-card";

export default async function IntegracoesPage() {
  const [integrations, projects] = await Promise.all([
    db.integration.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
    db.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const unhealthy = integrations.filter((i) => i.status === "ERROR" || i.status === "ATTENTION").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {integrations.length} integrações{unhealthy > 0 ? ` · ${unhealthy} precisam de atenção` : ""}
        </p>
        <CreateIntegrationDialog projects={projects} />
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhuma integração cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              projects={projects}
              integration={{
                id: integration.id,
                name: integration.name,
                category: integration.category,
                status: integration.status,
                url: integration.url,
                docsUrl: integration.docsUrl,
                notes: integration.notes,
                lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
                projectId: integration.projectId,
                projectName: integration.project?.name,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
