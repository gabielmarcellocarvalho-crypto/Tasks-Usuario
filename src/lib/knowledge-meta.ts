import type { KnowledgeType } from "@/generated/prisma/client";

export const KNOWLEDGE_TYPE_LABEL: Record<KnowledgeType, string> = {
  DOC: "Documentação",
  PROCESS: "Processo",
  TUTORIAL: "Tutorial",
  CHECKLIST: "Checklist",
  PROMPT: "Prompt",
  NOTE: "Anotação",
  LINK: "Link",
  REFERENCE: "Referência",
};

export const KNOWLEDGE_TYPES = Object.keys(KNOWLEDGE_TYPE_LABEL) as KnowledgeType[];
