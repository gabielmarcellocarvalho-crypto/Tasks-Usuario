"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ComponentKind } from "@/generated/prisma/client";

export const CATEGORIES = [
  "Gráficos",
  "Cards",
  "Tabelas",
  "Dashboard",
  "UI",
  "Formulários",
  "Navegação",
  "Modais",
  "Animações",
  "Landing Pages",
  "Seções",
  "Templates",
  "Outros",
];

export type ComponentFormDefaults = {
  name?: string;
  kind?: ComponentKind;
  category?: string;
  technology?: string;
  tags?: string;
  description?: string;
  origin?: string;
  originUrl?: string;
  language?: string;
  code?: string;
  previewUrl?: string;
};

export function ComponentFormFields({
  idPrefix,
  defaults = {},
  codeLabel = "Código",
  codeHelp,
}: {
  idPrefix: string;
  defaults?: ComponentFormDefaults;
  codeLabel?: string;
  codeHelp?: string;
}) {
  const id = (suffix: string) => `${idPrefix}-${suffix}`;
  const [preview, setPreview] = useState<string | undefined>(defaults.previewUrl);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("preview")}>Imagem de preview</Label>
        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-5 text-muted-foreground" />
            )}
          </div>
          <Input
            id={id("preview")}
            name="previewImage"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="max-w-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("name")}>Nome</Label>
        <Input
          id={id("name")}
          name="name"
          required
          autoFocus
          defaultValue={defaults.name}
          placeholder="Revenue Chart"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("kind")}>Tipo</Label>
          <Select
            name="kind"
            defaultValue={defaults.kind ?? "COMPONENT"}
            items={{ COMPONENT: "Componente", SECTION: "Seção", TEMPLATE: "Template" }}
          >
            <SelectTrigger id={id("kind")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPONENT">Componente</SelectItem>
              <SelectItem value="SECTION">Seção</SelectItem>
              <SelectItem value="TEMPLATE">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("category")}>Categoria</Label>
          <Select name="category" defaultValue={defaults.category ?? "UI"}>
            <SelectTrigger id={id("category")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("tech")}>Tecnologia</Label>
          <Input
            id={id("tech")}
            name="technology"
            placeholder="React, Tailwind"
            defaultValue={defaults.technology}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("tags")}>Tags (separadas por vírgula)</Label>
        <Input
          id={id("tags")}
          name="tags"
          placeholder="dashboard, chart, dark-mode"
          defaultValue={defaults.tags}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("description")}>Descrição</Label>
        <Textarea id={id("description")} name="description" rows={2} defaultValue={defaults.description} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("origin")}>Origem</Label>
          <Input id={id("origin")} name="origin" placeholder="Opcional" defaultValue={defaults.origin} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("origin-url")}>URL de origem</Label>
          <Input
            id={id("origin-url")}
            name="originUrl"
            placeholder="https://…"
            defaultValue={defaults.originUrl}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("language")}>Linguagem do código</Label>
        <Input
          id={id("language")}
          name="language"
          placeholder="tsx, css, json…"
          defaultValue={defaults.language}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("code")}>{codeLabel}</Label>
        <Textarea
          id={id("code")}
          name="code"
          rows={8}
          className="font-mono text-xs"
          placeholder="Cole o código aqui…"
          defaultValue={defaults.code}
        />
        {codeHelp ? <p className="text-xs text-muted-foreground">{codeHelp}</p> : null}
      </div>
    </>
  );
}
