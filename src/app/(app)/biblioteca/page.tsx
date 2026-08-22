import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CreateComponentDialog } from "@/components/library/create-component-dialog";
import { ComponentCard } from "@/components/library/component-card";
import { cn } from "@/lib/utils";

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ favoritos?: string; categoria?: string }>;
}) {
  const { favoritos, categoria } = await searchParams;

  const components = await db.component.findMany({
    where: {
      favorite: favoritos === "1" ? true : undefined,
      category: categoria || undefined,
    },
    orderBy: [{ favorite: "desc" }, { createdAt: "desc" }],
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
      _count: { select: { usages: true } },
    },
  });

  const allCategories = await db.component.findMany({
    distinct: ["category"],
    select: { category: true },
  });
  const categories = allCategories.map((c) => c.category).filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{components.length} itens</p>
        <CreateComponentDialog />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip href="/biblioteca" active={!favoritos && !categoria}>
          Todos
        </FilterChip>
        <FilterChip href="/biblioteca?favoritos=1" active={favoritos === "1"}>
          ⭐ Favoritos
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip key={cat} href={`/biblioteca?categoria=${encodeURIComponent(cat)}`} active={categoria === cat}>
            {cat}
          </FilterChip>
        ))}
      </div>

      {components.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum componente por aqui ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={{
                id: component.id,
                name: component.name,
                description: component.description,
                kind: component.kind,
                category: component.category,
                technology: component.technology,
                tags: JSON.parse(component.tags || "[]"),
                favorite: component.favorite,
                origin: component.origin,
                originUrl: component.originUrl,
                previewUrl: component.previewUrl,
                code: component.versions[0]?.code,
                language: component.versions[0]?.language,
                version: component.versions[0]?.version,
                usageCount: component._count.usages,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer text-xs",
          active && "border-primary/40 bg-primary/15 text-primary",
        )}
      >
        {children}
      </Badge>
    </Link>
  );
}
