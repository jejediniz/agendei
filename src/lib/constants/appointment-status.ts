import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Marcado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-900 border-amber-200/80",
  CONFIRMED: "bg-primary-light text-primary-dark border-primary/20",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200/80",
};

export const APPOINTMENT_STATUS_DOT_COLORS: Record<AppointmentStatus, string> =
  {
    SCHEDULED: "bg-amber-500",
    CONFIRMED: "bg-primary",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-slate-400",
  };
