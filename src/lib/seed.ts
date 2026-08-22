import { db } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms);
const from = (ms: number) => new Date(Date.now() + ms);

/**
 * Wipes every table (children first, FK order) and reloads a realistic demo
 * dataset. Used by the "reset demo data" action in Configurações and by
 * `prisma db seed` on a fresh clone — same function, two entry points.
 */
export async function resetDatabase() {
  await db.$transaction([
    db.componentUsage.deleteMany(),
    db.componentVersion.deleteMany(),
    db.component.deleteMany(),
    db.timeEntry.deleteMany(),
    db.task.deleteMany(),
    db.deadline.deleteMany(),
    db.integration.deleteMany(),
    db.knowledgeItem.deleteMany(),
    db.activity.deleteMany(),
    db.notification.deleteMany(),
    db.event.deleteMany(),
    db.webhook.deleteMany(),
    db.apiClient.deleteMany(),
    db.setting.deleteMany(),
    db.project.deleteMany(),
  ]);
}

export async function seedDemoData() {
  const platform = await db.project.create({
    data: {
      name: "Plataforma Pessoal",
      description: "OS pessoal de operações, tarefas e biblioteca de código.",
      status: "ACTIVE",
      color: "#7c6cf0",
      createdAt: ago(9 * DAY),
    },
  });

  const clienteX = await db.project.create({
    data: {
      name: "Cliente X — Campanha",
      description: "Campanha de lançamento para o Cliente X.",
      status: "ACTIVE",
      color: "#34c98e",
      createdAt: ago(5 * DAY),
    },
  });

  const landing = await db.project.create({
    data: {
      name: "Landing Page SaaS",
      description: "Página de vendas para o novo produto SaaS.",
      status: "PAUSED",
      color: "#e0a340",
      createdAt: ago(14 * DAY),
    },
  });

  const inProgressTask = await db.task.create({
    data: {
      title: "Criar integração Hermes",
      description: "Endpoints REST + autenticação por token para o agente.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: platform.id,
      dueDate: new Date(new Date().toDateString()),
      dueTime: "18:00",
      createdAt: ago(2 * DAY),
    },
  });

  const overdueTask = await db.task.create({
    data: {
      title: "Revisar campanha de anúncios",
      status: "TODO",
      priority: "URGENT",
      projectId: clienteX.id,
      dueDate: ago(1 * DAY),
      dueTime: "14:00",
      createdAt: ago(4 * DAY),
    },
  });

  await db.task.create({
    data: {
      title: "Escrever copy da hero section",
      status: "TODO",
      priority: "NORMAL",
      projectId: landing.id,
      dueDate: new Date(new Date().toDateString()),
      createdAt: ago(3 * DAY),
    },
  });

  await db.task.create({
    data: {
      title: "Configurar domínio próprio",
      status: "BACKLOG",
      priority: "LOW",
      projectId: platform.id,
      createdAt: ago(1 * DAY),
    },
  });

  await db.task.create({
    data: {
      title: "Aprovar paleta de cores",
      status: "WAITING",
      priority: "NORMAL",
      projectId: clienteX.id,
      dueDate: from(2 * DAY),
      createdAt: ago(2 * DAY),
    },
  });

  const doneTask = await db.task.create({
    data: {
      title: "Criar componente Revenue Chart",
      status: "DONE",
      priority: "NORMAL",
      projectId: platform.id,
      completedAt: ago(1 * DAY),
      createdAt: ago(3 * DAY),
    },
  });

  await db.timeEntry.create({
    data: { taskId: inProgressTask.id, startedAt: ago(32 * 60 * 1000) },
  });
  await db.timeEntry.create({
    data: {
      taskId: doneTask.id,
      startedAt: ago(1 * DAY + 3 * 60 * 60 * 1000),
      endedAt: ago(1 * DAY),
      durationSeconds: 3 * 60 * 60,
    },
  });
  await db.timeEntry.create({
    data: {
      taskId: overdueTask.id,
      startedAt: ago(2 * DAY),
      endedAt: ago(2 * DAY - 45 * 60 * 1000),
      durationSeconds: 45 * 60,
    },
  });

  await db.deadline.create({
    data: {
      name: "API OpenAI",
      type: "API",
      description: "Chave usada pelo Hermes e pela plataforma.",
      dueAt: from(20 * 60 * 60 * 1000),
      url: "https://platform.openai.com",
      projectId: platform.id,
      createdAt: ago(6 * DAY),
    },
  });
  await db.deadline.create({
    data: {
      name: "Certificado SSL — base.app",
      type: "SSL",
      dueAt: from(5 * DAY),
      projectId: platform.id,
      createdAt: ago(30 * DAY),
    },
  });
  await db.deadline.create({
    data: {
      name: "Domínio clientex.com.br",
      type: "DOMAIN",
      dueAt: from(45 * DAY),
      projectId: clienteX.id,
      periodicity: "anual",
      createdAt: ago(300 * DAY),
    },
  });
  await db.deadline.create({
    data: {
      name: "Hospedagem Landing Page",
      type: "HOSTING",
      dueAt: ago(2 * DAY),
      projectId: landing.id,
      createdAt: ago(365 * DAY),
    },
  });

  await db.integration.create({
    data: {
      name: "OpenAI",
      category: "IA",
      status: "CONNECTED",
      url: "https://platform.openai.com",
      lastSyncAt: ago(10 * 60 * 1000),
      projectId: platform.id,
      createdAt: ago(20 * DAY),
    },
  });
  await db.integration.create({
    data: {
      name: "Meta Ads",
      category: "Marketing",
      status: "CONNECTED",
      lastSyncAt: ago(2 * 60 * 60 * 1000),
      projectId: clienteX.id,
      createdAt: ago(15 * DAY),
    },
  });
  await db.integration.create({
    data: {
      name: "WhatsApp Business API",
      category: "Mensageria",
      status: "ATTENTION",
      notes: "Token próximo do vencimento.",
      lastSyncAt: ago(1 * DAY),
      createdAt: ago(40 * DAY),
    },
  });
  await db.integration.create({
    data: {
      name: "Sistema X",
      category: "Integração interna",
      status: "ERROR",
      notes: "Webhook retornando 500.",
      lastSyncAt: ago(3 * DAY),
      createdAt: ago(50 * DAY),
    },
  });

  const revenueChart = await db.component.create({
    data: {
      name: "Revenue Chart",
      description: "Gráfico de receita mensal com comparação ao período anterior.",
      kind: "COMPONENT",
      category: "Gráficos",
      technology: "React · Recharts",
      tags: JSON.stringify(["dashboard", "chart", "financeiro"]),
      favorite: true,
      origin: "Criado internamente",
      createdAt: ago(8 * DAY),
      versions: {
        create: {
          version: "1.0",
          language: "tsx",
          isCurrent: true,
          code: `export function RevenueChart({ data }: { data: { month: string; value: number }[] }) {\n  return <ResponsiveContainer>{/* ... */}</ResponsiveContainer>;\n}`,
        },
      },
    },
  });
  await db.component.create({
    data: {
      name: "KPI Card",
      kind: "COMPONENT",
      category: "Cards",
      technology: "React · Tailwind",
      tags: JSON.stringify(["dashboard", "kpi"]),
      createdAt: ago(7 * DAY),
      versions: {
        create: {
          version: "1.0",
          language: "tsx",
          isCurrent: true,
          code: `export function KpiCard({ label, value }: { label: string; value: string }) {\n  return (\n    <div className="rounded-lg border p-4">\n      <div className="text-2xl font-semibold">{value}</div>\n      <div className="text-xs text-muted-foreground">{label}</div>\n    </div>\n  );\n}`,
        },
      },
    },
  });
  await db.component.create({
    data: {
      name: "Pricing Section",
      kind: "SECTION",
      category: "Seções",
      technology: "React · Tailwind",
      tags: JSON.stringify(["landing-page", "pricing"]),
      createdAt: ago(12 * DAY),
    },
  });

  await db.componentUsage.create({
    data: { componentId: revenueChart.id, projectId: platform.id, usedAt: ago(6 * DAY) },
  });

  await db.knowledgeItem.create({
    data: {
      title: "Checklist de deploy",
      type: "CHECKLIST",
      content:
        "1. Rodar testes\n2. Conferir variáveis de ambiente\n3. Fazer backup do banco\n4. Deploy\n5. Checar logs por 10 minutos",
      tags: JSON.stringify(["deploy", "checklist"]),
      projectId: platform.id,
      createdAt: ago(10 * DAY),
    },
  });
  await db.knowledgeItem.create({
    data: {
      title: "Prompt padrão para o Hermes",
      type: "PROMPT",
      content: "Você é o Hermes, assistente pessoal conectado via WhatsApp...",
      tags: JSON.stringify(["hermes", "prompt"]),
      createdAt: ago(4 * DAY),
    },
  });

  await db.notification.create({
    data: {
      type: "TASK_OVERDUE",
      title: "Tarefa atrasada",
      message: `"${overdueTask.title}" venceu ontem.`,
      createdAt: ago(20 * 60 * 60 * 1000),
    },
  });
  await db.notification.create({
    data: {
      type: "INTEGRATION_ERROR",
      title: "Integração com erro",
      message: "Sistema X está retornando erro desde ontem.",
      createdAt: ago(18 * 60 * 60 * 1000),
    },
  });
  await db.notification.create({
    data: {
      type: "DEADLINE_UPCOMING",
      title: "Prazo próximo",
      message: "API OpenAI expira em menos de 24 horas.",
      createdAt: ago(3 * 60 * 60 * 1000),
    },
  });

  const activities: { type: string; title: string; projectId?: string; createdAt: Date }[] = [
    { type: "project.created", title: `Projeto criado: ${platform.name}`, projectId: platform.id, createdAt: ago(9 * DAY) },
    { type: "project.created", title: `Projeto criado: ${landing.name}`, projectId: landing.id, createdAt: ago(14 * DAY) },
    { type: "project.created", title: `Projeto criado: ${clienteX.name}`, projectId: clienteX.id, createdAt: ago(5 * DAY) },
    { type: "component.created", title: "Criado componente Revenue Chart V1", createdAt: ago(8 * DAY) },
    { type: "task.completed", title: `Concluiu "${doneTask.title}"`, projectId: platform.id, createdAt: ago(1 * DAY) },
    { type: "integration.created", title: "Integração Meta Ads conectada", projectId: clienteX.id, createdAt: ago(15 * DAY) },
    { type: "deadline.created", title: "Prazo criado: API OpenAI", projectId: platform.id, createdAt: ago(6 * DAY) },
    { type: "task.created", title: `Tarefa criada: ${inProgressTask.title}`, projectId: platform.id, createdAt: ago(2 * DAY) },
  ];
  await db.activity.createMany({ data: activities });
}
