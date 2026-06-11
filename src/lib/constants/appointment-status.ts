import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Marcado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

export const APPOINTMENT_STATUS_DOT_COLORS: Record<AppointmentStatus, string> =
  {
    SCHEDULED: "bg-amber-500",
    CONFIRMED: "bg-blue-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-slate-400",
  };
