"use client";

import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_DOT_COLORS,
} from "@/lib/constants/appointment-status";
import { StatusBadge } from "@/components/appointments/status-badge";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export function AgendaAppointmentCard({
  appointment,
  showProfessional = true,
  compact = false,
  onClick,
}: {
  appointment: AppointmentWithRelations;
  showProfessional?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-xl border text-left shadow-warm transition-all",
        "hover:shadow-warm-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        APPOINTMENT_STATUS_COLORS[appointment.status],
        compact ? "h-full px-2 py-1.5 pl-3" : "p-4 pl-5",
      )}
    >
      <span
        className={cn(
          "absolute bottom-0 left-0 top-0 w-1",
          APPOINTMENT_STATUS_DOT_COLORS[appointment.status],
        )}
        aria-hidden
      />
      <div
        className={cn(
          "flex items-start justify-between gap-2",
          compact && "items-center gap-1",
        )}
      >
        <p
          className={cn(
            "font-display font-semibold tabular-nums",
            compact ? "text-[10px] font-bold leading-tight" : "text-base",
          )}
        >
          {formatTime(appointment.startAt)} – {formatTime(appointment.endAt)}
        </p>
        {!compact && <StatusBadge status={appointment.status} />}
      </div>
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "truncate text-[10px] font-semibold leading-tight" : "mt-1",
        )}
      >
        {appointment.client.name}
      </p>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "truncate text-[9px] leading-tight opacity-80" : "text-sm",
        )}
      >
        {appointment.service.name}
      </p>
      {showProfessional && (
        <p
          className={cn(
            "text-muted-foreground",
            compact
              ? "truncate text-[9px] leading-tight opacity-70"
              : "mt-1 text-xs",
          )}
        >
          {appointment.professional.name}
        </p>
      )}
      {compact && (
        <div className="mt-0.5 flex items-center gap-1">
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              APPOINTMENT_STATUS_DOT_COLORS[appointment.status],
            )}
          />
          <span className="truncate text-[9px] leading-tight opacity-70">
            {appointment.professional.name.split(" ")[0]}
          </span>
        </div>
      )}
    </button>
  );
}
