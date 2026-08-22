"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/shell/sidebar-nav";

export function MobileNav({ footer }: { footer?: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left" className="w-[264px] p-0">
        <SheetHeader className="h-14 flex-row items-center gap-2 border-b border-sidebar-border px-4 py-0">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-3.5" strokeWidth={2.5} />
          </div>
          <SheetTitle
            render={
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-brand text-sm font-semibold tracking-tight"
              />
            }
          >
            Base
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-3.5rem)] flex-col bg-sidebar text-sidebar-foreground">
          <SidebarNav onNavigate={() => setOpen(false)} />
          {footer ? (
            <div className="border-t border-sidebar-border p-2.5">{footer}</div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
