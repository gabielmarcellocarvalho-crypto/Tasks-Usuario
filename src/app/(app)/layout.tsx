import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

// Every screen here reads live, frequently-changing data (tasks, timers,
// notifications). Prerendering any of it would serve stale snapshots.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 md:px-6 md:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
