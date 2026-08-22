import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Radar,
  Plug,
  LibraryBig,
  BookOpen,
  Activity,
  Bot,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/tarefas", label: "Tarefas", icon: ListTodo },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/monitor", label: "Monitor", icon: Radar },
  { href: "/integracoes", label: "Integrações", icon: Plug },
  { href: "/biblioteca", label: "Biblioteca", icon: LibraryBig },
  { href: "/conhecimento", label: "Conhecimento", icon: BookOpen },
  { href: "/atividade", label: "Atividade", icon: Activity },
  { href: "/hermes", label: "Hermes", icon: Bot },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/configuracoes",
  label: "Configurações",
  icon: Settings,
};

export function pageTitleFor(pathname: string): string {
  if (pathname === "/") return "Visão Geral";
  const all = [...NAV_ITEMS, SETTINGS_ITEM];
  const match = all.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Plataforma";
}
