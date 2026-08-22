import Link from "next/link";
import { Zap } from "lucide-react";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { HermesStatusPill } from "@/components/shell/hermes-status-pill";

const APP_VERSION = "0.1.0";

export function Sidebar() {
  return (
    <aside className="hidden w-[224px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-3.5" strokeWidth={2.5} />
        </div>
        <Link href="/" className="font-brand text-sm font-semibold tracking-tight">
          Base
        </Link>
      </div>

      <SidebarNav />

      <div className="flex flex-col gap-2 border-t border-sidebar-border p-2.5">
        <HermesStatusPill />
        <div className="flex items-center justify-between px-1 text-[11px] text-sidebar-foreground/40">
          <span>Base Pessoal</span>
          <span>v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
