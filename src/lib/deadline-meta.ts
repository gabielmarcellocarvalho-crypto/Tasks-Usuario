import type { DeadlineType } from "@/generated/prisma/client";

export const DEADLINE_TYPE_LABEL: Record<DeadlineType, string> = {
  API: "API",
  TOKEN: "Token",
  DOMAIN: "Domínio",
  HOSTING: "Hospedagem",
  SSL: "SSL",
  LICENSE: "Licença",
  SUBSCRIPTION: "Assinatura",
  CONTRACT: "Contrato",
  INTEGRATION: "Integração",
  CREDENTIAL: "Credencial",
  SERVICE: "Serviço",
  DOCUMENT: "Documento",
  OTHER: "Outro",
};

export const DEADLINE_TYPES = Object.keys(DEADLINE_TYPE_LABEL) as DeadlineType[];
