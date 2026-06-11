import { BusinessType } from "@prisma/client";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  SALON: "Salão de beleza",
  CLINIC: "Clínica",
  WORKSHOP: "Oficina",
  CONSULTING: "Consultoria",
  OTHER: "Outro",
};

export const BUSINESS_TYPE_OPTIONS = Object.entries(BUSINESS_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as BusinessType, label }),
);
