import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Marcado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-accent-light text-accent border-accent/20",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export const APPOINTMENT_STATUS_DOT_COLORS: Record<AppointmentStatus, string> =
  {
    SCHEDULED: "bg-amber-500",
    CONFIRMED: "bg-accent",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-muted-foreground/50",
  };
