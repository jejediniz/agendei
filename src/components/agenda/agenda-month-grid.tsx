"use client";

import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { APPOINTMENT_STATUS_DOT_COLORS } from "@/lib/constants/appointment-status";
import { formatDateKey, formatTime, toDateKey } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MAX_CHIPS = 3;

type AgendaMonthGridProps = {
  monthDays: Array<{ date: string; inMonth: boolean }>;
  appointments: AppointmentWithRelations[];
  todayKey: string;
  onDaySelect?: (date: string) => void;
};

export function AgendaMonthGrid({
  monthDays,
  appointments,
  todayKey,
  onDaySelect,
}: AgendaMonthGridProps) {
  const byDay = new Map<string, AppointmentWithRelations[]>();
  for (const apt of appointments) {
    const key = toDateKey(new Date(apt.startAt));
    const list = byDay.get(key) ?? [];
    list.push(apt);
    byDay.set(key, list);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-warm">
      <div className="grid grid-cols-7 border-b border-border/60 bg-surface">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day) => {
          const dayAppointments = byDay.get(day.date) ?? [];
          const isToday = day.date === todayKey;
          const extra = dayAppointments.length - MAX_CHIPS;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDaySelect?.(day.date)}
              className={cn(
                "flex min-h-[92px] flex-col gap-1 border-b border-r border-border/40 p-1.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&:nth-child(7n)]:border-r-0",
                !day.inMonth && "bg-muted/20",
              )}
              title={`Abrir ${formatDateKey(day.date, "dd/MM/yyyy")}`}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : day.inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50",
                )}
              >
                {formatDateKey(day.date, "d")}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayAppointments.slice(0, MAX_CHIPS).map((apt) => (
                  <span
                    key={apt.id}
                    className="flex items-center gap-1 truncate rounded-md bg-muted/60 px-1 py-0.5 text-[10px] leading-tight text-foreground"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        APPOINTMENT_STATUS_DOT_COLORS[apt.status],
                      )}
                    />
                    <span className="truncate">
                      {formatTime(apt.startAt)} {apt.client.name.split(" ")[0]}
                    </span>
                  </span>
                ))}
                {extra > 0 && (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground">
                    +{extra} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
