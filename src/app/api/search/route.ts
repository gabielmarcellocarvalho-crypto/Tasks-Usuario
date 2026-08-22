import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  group: "Tarefas" | "Projetos" | "Componentes" | "Integrações" | "Conhecimento" | "Prazos";
  href: string;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [tasks, projects, components, integrations, knowledge, deadlines] = await Promise.all([
    db.task.findMany({
      where: { title: { contains: q } },
      take: 5,
      select: { id: true, title: true, project: { select: { name: true } } },
    }),
    db.project.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true, status: true },
    }),
    db.component.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true, category: true },
    }),
    db.integration.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true, category: true },
    }),
    db.knowledgeItem.findMany({
      where: { title: { contains: q } },
      take: 5,
      select: { id: true, title: true, type: true },
    }),
    db.deadline.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true, type: true },
    }),
  ]);

  const results: SearchResult[] = [
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.project?.name,
      group: "Tarefas" as const,
      href: `/tarefas?task=${t.id}`,
    })),
    ...projects.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.status,
      group: "Projetos" as const,
      href: `/projetos/${p.id}`,
    })),
    ...components.map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: c.category ?? undefined,
      group: "Componentes" as const,
      href: `/biblioteca?component=${c.id}`,
    })),
    ...integrations.map((i) => ({
      id: i.id,
      title: i.name,
      subtitle: i.category ?? undefined,
      group: "Integrações" as const,
      href: `/integracoes?integration=${i.id}`,
    })),
    ...knowledge.map((k) => ({
      id: k.id,
      title: k.title,
      subtitle: k.type,
      group: "Conhecimento" as const,
      href: `/conhecimento?doc=${k.id}`,
    })),
    ...deadlines.map((d) => ({
      id: d.id,
      title: d.name,
      subtitle: d.type,
      group: "Prazos" as const,
      href: `/monitor?deadline=${d.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
