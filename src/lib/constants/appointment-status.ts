import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Marcado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em atendimento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-900 border-amber-200/80",
  CONFIRMED: "bg-primary-light text-primary-dark border-primary/20",
  IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200/80",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200/80",
  NO_SHOW: "bg-rose-50 text-rose-800 border-rose-200/80",
};

export const APPOINTMENT_STATUS_DOT_COLORS: Record<AppointmentStatus, string> =
  {
    SCHEDULED: "bg-amber-500",
    CONFIRMED: "bg-primary",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-slate-400",
    NO_SHOW: "bg-rose-500",
  };
