import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Marcado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-900 border-amber-200/80",
  CONFIRMED: "bg-accent-light text-accent border-accent/25",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  CANCELLED: "bg-stone-100 text-stone-600 border-stone-200/80",
};

export const APPOINTMENT_STATUS_DOT_COLORS: Record<AppointmentStatus, string> =
  {
    SCHEDULED: "bg-amber-500",
    CONFIRMED: "bg-accent",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-muted-foreground/50",
  };
