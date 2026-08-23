import { db } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { ApiClientsPanel } from "@/components/hermes/api-clients-panel";
import { Activity, CheckCircle2, Clock, Radio } from "lucide-react";
import { relativeTimeFromNow } from "@/lib/format";

export default async function HermesPage() {
  const [totalEvents, deliveredEvents, lastEvent, clients] = await Promise.all([
    db.event.count(),
    db.event.count({ where: { deliveredToHermes: true } }),
    db.event.findFirst({ orderBy: { createdAt: "desc" } }),
    db.apiClient.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const mostRecentSeen = clients
    .filter((c) => c.lastSeenAt)
    .sort((a, b) => (b.lastSeenAt!.getTime() - a.lastSeenAt!.getTime()))[0];
  const online = mostRecentSeen && Date.now() - mostRecentSeen.lastSeenAt!.getTime() < 5 * 60 * 1000;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Status"
          value={online ? "Online" : "Offline"}
          icon={Radio}
          tone={online ? "success" : "default"}
        />
        <StatCard
          label="Último heartbeat"
          value={mostRecentSeen?.lastSeenAt ? relativeTimeFromNow(mostRecentSeen.lastSeenAt) : "—"}
          icon={Clock}
        />
        <StatCard label="Eventos gerados" value={totalEvents} icon={Activity} />
        <StatCard label="Eventos entregues" value={deliveredEvents} icon={CheckCircle2} />
      </div>

      <ApiClientsPanel
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          active: c.active,
          lastSeenAt: c.lastSeenAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
        }))}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Como conectar o Hermes</h2>
        <p className="text-sm text-muted-foreground">
          O Hermes roda como um cliente externo, numa VPS separada. Ele se autentica com um dos
          tokens acima no header <code className="rounded bg-muted px-1 py-0.5">Authorization: Bearer &lt;token&gt;</code>{" "}
          e consome a API REST abaixo.
        </p>
        <ul className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
          <li><code className="text-foreground">GET /api/v1/tasks</code> — tarefas (filtros: status, overdue, today)</li>
          <li><code className="text-foreground">POST /api/v1/tasks</code> — criar tarefa</li>
          <li><code className="text-foreground">PATCH /api/v1/tasks/:id</code> — atualizar status/prioridade</li>
          <li><code className="text-foreground">GET/POST /api/v1/projects</code> — listar/criar projetos</li>
          <li><code className="text-foreground">GET/POST /api/v1/deadlines</code> — listar/criar prazos (Monitor)</li>
          <li><code className="text-foreground">GET/POST /api/v1/integrations</code> — listar/criar integrações</li>
          <li><code className="text-foreground">GET/POST /api/v1/knowledge</code> — listar/criar documentos (Conhecimento)</li>
          <li><code className="text-foreground">GET /api/v1/components</code> — biblioteca de componentes</li>
          <li><code className="text-foreground">GET /api/v1/activity</code> — timeline de atividade</li>
          <li><code className="text-foreground">GET /api/v1/alerts</code> — tudo que precisa de atenção agora</li>
          <li><code className="text-foreground">GET /api/v1/events?since=</code> — fila de eventos para consumir</li>
        </ul>
      </div>
    </div>
  );
}
