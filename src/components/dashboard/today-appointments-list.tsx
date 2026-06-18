"use client";

import { Phone } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { formatTime } from "@/lib/utils/date";
import { isValidContactPhone } from "@/lib/utils/contact-links";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_DOT_COLORS,
} from "@/lib/constants/appointment-status";

type TodayAppointmentsListProps = {
  appointments: AppointmentWithRelations[];
  highlightId?: string | null;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
};

export function TodayAppointmentsList({
  appointments,
  highlightId,
  onAppointmentClick,
}: TodayAppointmentsListProps) {
  return (
    <div className="space-y-2">
      {appointments.map((apt) => {
        const hasPhone = isValidContactPhone(apt.client.phone);
        const isHighlighted = highlightId === apt.id;

        return (
          <button
            key={apt.id}
            type="button"
            onClick={() => onAppointmentClick(apt)}
            className={cn(
              "relative w-full cursor-pointer overflow-hidden rounded-xl border text-left shadow-warm transition-all",
              "hover:shadow-warm-md active:scale-[0.99]",
              APPOINTMENT_STATUS_COLORS[apt.status],
              isHighlighted && "ring-2 ring-primary/30",
            )}
          >
            <span
              className={cn(
                "absolute bottom-0 left-0 top-0 w-1",
                APPOINTMENT_STATUS_DOT_COLORS[apt.status],
              )}
              aria-hidden
            />
            <div className="flex flex-col gap-3 px-4 py-3.5 pl-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-card/60 px-2 py-1.5">
                  <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {formatTime(apt.startAt)}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {formatTime(apt.endAt)}
                  </span>
                </div>
                <Avatar name={apt.client.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {apt.client.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {apt.service.name} · {apt.professional.name}
                  </p>
                  {hasPhone && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      {apt.client.phone}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={apt.status} className="self-start sm:self-center" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
