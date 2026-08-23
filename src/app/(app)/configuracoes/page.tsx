import { DangerZone } from "@/components/settings/danger-zone";

export default function ConfiguracoesPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section id="perfil" className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Plataforma de uso pessoal — sem login por enquanto. A estrutura já está pronta para
          adicionar autenticação e múltiplos usuários no futuro sem reconstruir a aplicação.
        </p>
      </section>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Sobre</h2>
        <dl className="grid grid-cols-2 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Versão</dt>
          <dd>0.1.0</dd>
          <dt className="text-muted-foreground">Banco de dados</dt>
          <dd>PostgreSQL (Prisma Postgres)</dd>
          <dt className="text-muted-foreground">Integração</dt>
          <dd>Hermes via API REST + tokens</dd>
        </dl>
      </section>

      <DangerZone />
    </div>
  );
}
