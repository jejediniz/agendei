"use client";

import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { AgendaAppointmentCard } from "@/components/agenda/agenda-appointment-card";
import {
  formatDateKey,
  minutesFromDateInTimezone,
  toDateKey,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import {
  AGENDA_SLOT_HEIGHT_PX,
  AGENDA_SLOT_MINUTES,
  AGENDA_TIME_GUTTER_WIDTH_PX,
  getAgendaGridMetrics,
  resolveHoursFromAppointments,
  slotTopFromMinutes,
} from "@/components/agenda/agenda-grid-constants";

const WEEK_COLUMN_MIN_WIDTH_PX = 130;

type AgendaWeekGridProps = {
  weekDays: string[];
  appointments: AppointmentWithRelations[];
  todayKey: string;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onDaySelect?: (date: string) => void;
};

export function AgendaWeekGrid({
  weekDays,
  appointments,
  todayKey,
  onAppointmentClick,
  onDaySelect,
}: AgendaWeekGridProps) {
  const { startHour, endHour } = resolveHoursFromAppointments(appointments);
  const { gridStartMinutes, gridEndMinutes, totalSlots, gridHeight } =
    getAgendaGridMetrics(startHour, endHour);

  const timeLabels = Array.from({ length: totalSlots + 1 }, (_, i) => {
    const minutes = gridStartMinutes + i * AGENDA_SLOT_MINUTES;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60,
    ).padStart(2, "0")}`;
  });

  const byDay = new Map<string, AppointmentWithRelations[]>();
  for (const apt of appointments) {
    const key = toDateKey(new Date(apt.startAt));
    const list = byDay.get(key) ?? [];
    list.push(apt);
    byDay.set(key, list);
  }

  const gridMinWidth =
    AGENDA_TIME_GUTTER_WIDTH_PX + weekDays.length * WEEK_COLUMN_MIN_WIDTH_PX;

  return (
    <>
      {/* Mobile: lista agrupada por dia */}
      <div className="space-y-4 md:hidden">
        {weekDays.map((day) => {
          const dayAppointments = byDay.get(day) ?? [];
          const isToday = day === todayKey;
          return (
            <div key={day}>
              <button
                type="button"
                onClick={() => onDaySelect?.(day)}
                className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left"
              >
                <span
                  className={cn(
                    "text-sm font-semibold capitalize",
                    isToday ? "text-primary" : "text-foreground",
                  )}
                >
                  {formatDateKey(day, "EEEE, dd/MM")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dayAppointments.length > 0
                    ? `${dayAppointments.length} agend.`
                    : "livre"}
                </span>
              </button>
              {dayAppointments.length > 0 && (
                <div className="space-y-2">
                  {dayAppointments.map((apt) => (
                    <AgendaAppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onClick={() => onAppointmentClick?.(apt)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: grade semanal */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-warm md:block">
        <div className="overflow-x-auto">
          <div style={{ minWidth: gridMinWidth }}>
            <div className="sticky top-0 z-20 flex border-b border-border/60 bg-surface">
              <div
                className="shrink-0 border-r border-border/60"
                style={{ width: AGENDA_TIME_GUTTER_WIDTH_PX }}
              />
              {weekDays.map((day) => {
                const isToday = day === todayKey;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onDaySelect?.(day)}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center border-r border-border/60 py-2.5 text-center transition-colors last:border-r-0 hover:bg-muted/60",
                      isToday && "bg-primary-light/60",
                    )}
                    style={{ minWidth: WEEK_COLUMN_MIN_WIDTH_PX }}
                    title={`Abrir ${formatDateKey(day, "dd/MM")}`}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {formatDateKey(day, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-lg font-semibold tabular-nums",
                        isToday ? "text-primary" : "text-foreground",
                      )}
                    >
                      {formatDateKey(day, "dd")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
              <div className="flex">
                <div
                  className="relative shrink-0 border-r border-border/60 bg-card"
                  style={{
                    width: AGENDA_TIME_GUTTER_WIDTH_PX,
                    height: gridHeight,
                  }}
                >
                  {timeLabels.map((label, i) => (
                    <div
                      key={label}
                      className={cn(
                        "absolute right-2 -translate-y-1/2 text-[10px] tabular-nums",
                        i % 2 === 0
                          ? "font-medium text-muted-foreground"
                          : "text-muted-foreground/50",
                      )}
                      style={{ top: i * AGENDA_SLOT_HEIGHT_PX }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {weekDays.map((day) => {
                  const dayAppointments = byDay.get(day) ?? [];
                  const isToday = day === todayKey;
                  return (
                    <div
                      key={day}
                      className={cn(
                        "relative flex-1 border-r border-border/40 last:border-r-0",
                        isToday && "bg-primary-light/10",
                      )}
                      style={{
                        minWidth: WEEK_COLUMN_MIN_WIDTH_PX,
                        height: gridHeight,
                      }}
                    >
                      {Array.from({ length: totalSlots }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute left-0 right-0 border-t",
                            i % 2 === 0 ? "border-border/50" : "border-border/25",
                          )}
                          style={{ top: i * AGENDA_SLOT_HEIGHT_PX }}
                        />
                      ))}

                      {dayAppointments.map((apt) => {
                        const startMin = minutesFromDateInTimezone(
                          new Date(apt.startAt),
                        );
                        const endMin = minutesFromDateInTimezone(
                          new Date(apt.endAt),
                        );
                        const clampedStart = Math.max(startMin, gridStartMinutes);
                        const clampedEnd = Math.min(endMin, gridEndMinutes);
                        if (
                          clampedEnd <= gridStartMinutes ||
                          clampedStart >= gridEndMinutes
                        ) {
                          return null;
                        }
                        const top = slotTopFromMinutes(
                          clampedStart,
                          gridStartMinutes,
                        );
                        const height = Math.max(
                          slotTopFromMinutes(clampedEnd, gridStartMinutes) -
                            top -
                            1,
                          AGENDA_SLOT_HEIGHT_PX * 0.75,
                        );
                        return (
                          <div
                            key={apt.id}
                            className="absolute inset-x-0.5 z-10"
                            style={{ top: top + 1, height }}
                          >
                            <AgendaAppointmentCard
                              appointment={apt}
                              compact
                              onClick={() => onAppointmentClick?.(apt)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
