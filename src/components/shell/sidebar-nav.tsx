"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/lib/nav";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col justify-between overflow-y-auto px-2 py-3">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={2} />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="flex flex-col gap-0.5 border-t border-sidebar-border pt-2">
        <li>
          <Link
            href={SETTINGS_ITEM.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              pathname.startsWith(SETTINGS_ITEM.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <SETTINGS_ITEM.icon className="size-4 shrink-0" strokeWidth={2} />
            <span className="truncate">{SETTINGS_ITEM.label}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
