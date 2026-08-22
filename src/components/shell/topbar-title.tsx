"use client";

import { usePathname } from "next/navigation";
import { pageTitleFor } from "@/lib/nav";

export function TopbarTitle() {
  const pathname = usePathname();
  return <h1 className="truncate text-sm font-semibold">{pageTitleFor(pathname)}</h1>;
}
