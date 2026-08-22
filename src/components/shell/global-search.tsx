"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import type { SearchResult } from "@/app/api/search/route";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  function select(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Buscar...</span>
        <Kbd>Ctrl K</Kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar tarefas, projetos, componentes, integrações…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim().length >= 2 && results.length === 0 ? (
              <CommandEmpty>Nada encontrado para “{query}”.</CommandEmpty>
            ) : null}
            {query.trim().length < 2 ? (
              <CommandEmpty>Digite ao menos 2 caracteres.</CommandEmpty>
            ) : null}
            {Object.entries(grouped).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={`${item.group}-${item.id}`}
                    value={`${item.group}-${item.id}`}
                    onSelect={() => select(item.href)}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.subtitle ? (
                      <span className="ml-auto text-xs text-muted-foreground">{item.subtitle}</span>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
