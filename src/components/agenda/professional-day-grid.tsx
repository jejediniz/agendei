"use client";

import Link from "next/link";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import type { Availability, Professional } from "@prisma/client";
import { Users } from "lucide-react";
import { AgendaAppointmentCard } from "@/components/agenda/agenda-appointment-card";
import {
  getDayOfWeek,
  minutesFromDateInTimezone,
  combineDateAndTime,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import {
  AGENDA_COLUMN_WIDTH_PX,
  AGENDA_SLOT_HEIGHT_PX,
  AGENDA_SLOT_MINUTES,
  AGENDA_TIME_GUTTER_WIDTH_PX,
  getAgendaGridMetrics,
  resolveAgendaGridHours,
  slotTopFromMinutes,
} from "@/components/agenda/agenda-grid-constants";

type ProfessionalDayGridProps = {
  professionals: Professional[];
  appointments: AppointmentWithRelations[];
  availabilities: Availability[];
  date: string;
  highlightProfessionalId?: string;
  onProfessionalFilter?: (professionalId: string | null) => void;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onSlotClick?: (professionalId: string, time: string) => void;
};

export function ProfessionalDayGrid({
  professionals,
  appointments,
  availabilities,
  date,
  highlightProfessionalId,
  onProfessionalFilter,
  onAppointmentClick,
  onSlotClick,
}: ProfessionalDayGridProps) {
  const dayOfWeek = getDayOfWeek(combineDateAndTime(date, "12:00"));
  const { startHour, endHour } = resolveAgendaGridHours(
    appointments,
    availabilities,
    dayOfWeek,
  );
  const { gridStartMinutes, gridEndMinutes, totalSlots, gridHeight } =
    getAgendaGridMetrics(startHour, endHour);

  const timeLabels = Array.from({ length: totalSlots + 1 }, (_, i) => {
    const minutes = gridStartMinutes + i * AGENDA_SLOT_MINUTES;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  });

  const visibleProfessionals = highlightProfessionalId
    ? professionals.filter((p) => p.id === highlightProfessionalId)
    : professionals.filter((p) => p.active);

  if (visibleProfessionals.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card px-6 py-16 text-center shadow-warm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nenhum profissional ativo para exibir na agenda. Cadastre ou ative um
          profissional para começar.
        </p>
        <Link
          href="/profissionais/novo"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Cadastrar profissional
        </Link>
      </div>
    );
  }

  const visibleIds = new Set(visibleProfessionals.map((p) => p.id));
  const dayAppointments = appointments
    .filter((apt) => visibleIds.has(apt.professionalId))
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  const activeProfessionals = professionals.filter((p) => p.active);

  return (
    <div className="relative pb-safe-fab">
      {/* Mobile: filtros + lista de cards */}
      <div className="space-y-4 md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onProfessionalFilter?.(null)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
              !highlightProfessionalId
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Todos
          </button>
          {activeProfessionals.map((professional) => {
            const isHighlighted = highlightProfessionalId === professional.id;
            return (
              <button
                key={professional.id}
                type="button"
                onClick={() =>
                  onProfessionalFilter?.(isHighlighted ? null : professional.id)
                }
                className={cn(
                  "shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                  isHighlighted
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-border bg-card text-muted-foreground",
                )}
                aria-pressed={isHighlighted}
              >
                {professional.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {dayAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-12 text-center text-sm leading-relaxed text-muted-foreground">
            Nenhum agendamento neste dia. Quando houver horários marcados, eles
            aparecerão aqui na agenda.
          </div>
        ) : (
          <div className="space-y-3">
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

      {/* Desktop: grade por colunas */}
      <DesktopAgendaGrid
        visibleProfessionals={visibleProfessionals}
        appointments={appointments}
        highlightProfessionalId={highlightProfessionalId}
        onProfessionalFilter={onProfessionalFilter}
        onAppointmentClick={onAppointmentClick}
        onSlotClick={onSlotClick}
        timeLabels={timeLabels}
        gridStartMinutes={gridStartMinutes}
        gridEndMinutes={gridEndMinutes}
        totalSlots={totalSlots}
        gridHeight={gridHeight}
      />

      <Link
        href="/agendamentos/novo"
        className="fab-safe fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm-lg transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-10"
        aria-label="Novo agendamento"
      >
        <span className="text-2xl font-light leading-none">+</span>
      </Link>
    </div>
  );
}

function DesktopAgendaGrid({
  visibleProfessionals,
  appointments,
  highlightProfessionalId,
  onProfessionalFilter,
  onAppointmentClick,
  onSlotClick,
  timeLabels,
  gridStartMinutes,
  gridEndMinutes,
  totalSlots,
  gridHeight,
}: {
  visibleProfessionals: Professional[];
  appointments: AppointmentWithRelations[];
  highlightProfessionalId?: string;
  onProfessionalFilter?: (professionalId: string | null) => void;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onSlotClick?: (professionalId: string, time: string) => void;
  timeLabels: string[];
  gridStartMinutes: number;
  gridEndMinutes: number;
  totalSlots: number;
  gridHeight: number;
}) {
  const gridMinWidth =
    AGENDA_TIME_GUTTER_WIDTH_PX + visibleProfessionals.length * AGENDA_COLUMN_WIDTH_PX;

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-warm md:block">
      <div className="overflow-x-auto">
        <div style={{ minWidth: gridMinWidth }}>
          <div className="sticky top-0 z-20 flex border-b border-border/60 bg-surface">
            <div
              className="flex shrink-0 items-end justify-center border-r border-border/60 pb-2"
              style={{ width: AGENDA_TIME_GUTTER_WIDTH_PX }}
            >
              <button
                type="button"
                onClick={() => onProfessionalFilter?.(null)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  !highlightProfessionalId
                    ? "bg-primary-light text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
                title="Todos os profissionais"
                aria-label="Mostrar todos os profissionais"
              >
                <Users className="h-4 w-4" />
              </button>
            </div>

            {visibleProfessionals.map((professional) => {
              const isHighlighted = highlightProfessionalId === professional.id;

              return (
                <button
                  key={professional.id}
                  type="button"
                  onClick={() =>
                    onProfessionalFilter?.(isHighlighted ? null : professional.id)
                  }
                  className={cn(
                    "flex shrink-0 flex-col items-center justify-center border-r border-border/60 px-2 py-2.5 text-center transition-colors last:border-r-0",
                    isHighlighted ? "bg-primary-light/70" : "hover:bg-muted/60",
                  )}
                  style={{ width: AGENDA_COLUMN_WIDTH_PX }}
                  title={
                    isHighlighted
                      ? `Mostrar todos (filtrando ${professional.name})`
                      : `Filtrar ${professional.name}`
                  }
                  aria-label={
                    isHighlighted
                      ? `Remover filtro de ${professional.name}`
                      : `Filtrar agenda por ${professional.name}`
                  }
                  aria-pressed={isHighlighted}
                >
                  <span className="w-full truncate text-xs font-semibold text-foreground">
                    {professional.name.split(" ")[0]}
                  </span>
                  {professional.specialty && (
                    <span className="w-full truncate text-[10px] text-muted-foreground">
                      {professional.specialty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div className="flex">
              <div
                className="relative shrink-0 border-r border-border/60 bg-card"
                style={{ width: AGENDA_TIME_GUTTER_WIDTH_PX, height: gridHeight }}
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

              <div className="flex">
                {visibleProfessionals.map((professional) => {
                  const proAppointments = appointments.filter(
                    (apt) => apt.professionalId === professional.id,
                  );
                  const isHighlighted = highlightProfessionalId === professional.id;

                  return (
                    <div
                      key={professional.id}
                      className={cn(
                        "relative shrink-0 border-r border-border/40 last:border-r-0",
                        isHighlighted && "bg-primary-light/10",
                      )}
                      style={{
                        width: AGENDA_COLUMN_WIDTH_PX,
                        height: gridHeight,
                      }}
                    >
                      {Array.from({ length: totalSlots }).map((_, i) =>
                        onSlotClick ? (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              onSlotClick(professional.id, timeLabels[i])
                            }
                            title={`Agendar às ${timeLabels[i]}`}
                            aria-label={`Agendar ${professional.name} às ${timeLabels[i]}`}
                            className={cn(
                              "group absolute left-0 right-0 border-t transition-colors hover:bg-primary-light/40",
                              i % 2 === 0
                                ? "border-border/50"
                                : "border-border/25",
                            )}
                            style={{
                              top: i * AGENDA_SLOT_HEIGHT_PX,
                              height: AGENDA_SLOT_HEIGHT_PX,
                            }}
                          >
                            <span className="pointer-events-none absolute right-1 top-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              +
                            </span>
                          </button>
                        ) : (
                          <div
                            key={i}
                            className={cn(
                              "absolute left-0 right-0 border-t",
                              i % 2 === 0
                                ? "border-border/50"
                                : "border-border/25",
                            )}
                            style={{ top: i * AGENDA_SLOT_HEIGHT_PX }}
                          />
                        ),
                      )}

                      {proAppointments.map((apt) => {
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
                          slotTopFromMinutes(clampedEnd, gridStartMinutes) - top - 1,
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
                              showProfessional={false}
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
    </div>
  );
}
