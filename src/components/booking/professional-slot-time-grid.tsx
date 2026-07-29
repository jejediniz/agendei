"use client";

import type { Professional } from "@prisma/client";
import { cn } from "@/lib/utils/cn";
import { ProfessionalSlotMobileList } from "@/components/booking/professional-slot-mobile-list";
import {
  AGENDA_COLUMN_WIDTH_PX,
  AGENDA_SLOT_HEIGHT_PX,
  AGENDA_SLOT_MINUTES,
  AGENDA_TIME_GUTTER_WIDTH_PX,
  getAgendaGridMetrics,
  AGENDA_GRID_DEFAULT_START_HOUR,
  AGENDA_GRID_DEFAULT_END_HOUR,
  slotTopFromMinutes,
} from "@/components/agenda/agenda-grid-constants";
import { parseTimeToMinutes } from "@/lib/utils/date";

type ProfessionalSlotTimeGridProps = {
  professionals: Professional[];
  slotsByProfessional: Record<string, string[]>;
  loading?: boolean;
  selectedProfessionalId?: string;
  selectedTime?: string;
  onSelect: (professionalId: string, time: string) => void;
};

export function ProfessionalSlotTimeGrid({
  professionals,
  slotsByProfessional,
  loading = false,
  selectedProfessionalId,
  selectedTime,
  onSelect,
}: ProfessionalSlotTimeGridProps) {
  const activeProfessionals = professionals.filter((p) => p.active);
  const { gridStartMinutes, totalSlots, gridHeight } = getAgendaGridMetrics(
    AGENDA_GRID_DEFAULT_START_HOUR,
    AGENDA_GRID_DEFAULT_END_HOUR,
  );

  const timeLabels = Array.from({ length: totalSlots + 1 }, (_, i) => {
    const minutes = gridStartMinutes + i * AGENDA_SLOT_MINUTES;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  });

  return (
    <>
      {/* Mobile: cards com horários grandes para toque */}
      <div className="md:hidden">
        <ProfessionalSlotMobileList
          professionals={professionals}
          slotsByProfessional={slotsByProfessional}
          loading={loading}
          selectedProfessionalId={selectedProfessionalId}
          selectedTime={selectedTime}
          onSelect={onSelect}
        />
      </div>

      {/* Desktop: grade por colunas */}
      <div className="hidden md:block">
        {loading ? (
          <div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-16 text-center text-sm text-muted-foreground">
            Carregando horários disponíveis...
          </div>
        ) : activeProfessionals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
            Nenhum profissional disponível.
          </div>
        ) : !activeProfessionals.some(
            (p) => (slotsByProfessional[p.id]?.length ?? 0) > 0,
          ) ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
            Nenhum horário disponível neste dia. Escolha outra data na semana acima.
          </div>
        ) : (
          <DesktopSlotGrid
            activeProfessionals={activeProfessionals}
            slotsByProfessional={slotsByProfessional}
            selectedProfessionalId={selectedProfessionalId}
            selectedTime={selectedTime}
            onSelect={onSelect}
            timeLabels={timeLabels}
            gridStartMinutes={gridStartMinutes}
            totalSlots={totalSlots}
            gridHeight={gridHeight}
          />
        )}
      </div>
    </>
  );
}

function DesktopSlotGrid({
  activeProfessionals,
  slotsByProfessional,
  selectedProfessionalId,
  selectedTime,
  onSelect,
  timeLabels,
  gridStartMinutes,
  totalSlots,
  gridHeight,
}: {
  activeProfessionals: Professional[];
  slotsByProfessional: Record<string, string[]>;
  selectedProfessionalId?: string;
  selectedTime?: string;
  onSelect: (professionalId: string, time: string) => void;
  timeLabels: string[];
  gridStartMinutes: number;
  totalSlots: number;
  gridHeight: number;
}) {
  const gridMinWidth =
    AGENDA_TIME_GUTTER_WIDTH_PX + activeProfessionals.length * AGENDA_COLUMN_WIDTH_PX;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-warm">
      <div className="overflow-x-auto">
        <div style={{ minWidth: gridMinWidth }}>
          <div className="flex border-b border-border/60 bg-surface">
            <div style={{ width: AGENDA_TIME_GUTTER_WIDTH_PX }} className="shrink-0" />
            {activeProfessionals.map((professional) => (
              <div
                key={professional.id}
                className="flex shrink-0 items-center justify-center border-r border-border/60 px-2 py-3 last:border-r-0"
                style={{ width: AGENDA_COLUMN_WIDTH_PX }}
              >
                <span className="truncate text-xs font-semibold text-foreground">
                  {professional.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="max-h-[min(28rem,50dvh)] overflow-y-auto">
            <div className="flex">
              <div
                className="relative shrink-0 border-r border-border/60"
                style={{ width: AGENDA_TIME_GUTTER_WIDTH_PX, height: gridHeight }}
              >
                {timeLabels.map((label, i) => (
                  <div
                    key={label}
                    className={cn(
                      "absolute right-2 -translate-y-1/2 text-xs tabular-nums",
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
                {activeProfessionals.map((professional) => {
                  const slots = slotsByProfessional[professional.id] ?? [];

                  return (
                    <div
                      key={professional.id}
                      className="relative shrink-0 border-r border-border/40 last:border-r-0"
                      style={{ width: AGENDA_COLUMN_WIDTH_PX, height: gridHeight }}
                    >
                      {Array.from({ length: totalSlots }).map((_, i) => (
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
                      ))}

                      {slots.map((slot) => {
                        const slotMinutes = parseTimeToMinutes(slot);
                        const top = slotTopFromMinutes(slotMinutes, gridStartMinutes);
                        const isSelected =
                          selectedProfessionalId === professional.id &&
                          selectedTime === slot;

                        return (
                          <button
                            key={`${professional.id}-${slot}`}
                            type="button"
                            onClick={() => onSelect(professional.id, slot)}
                            className={cn(
                              "absolute inset-x-0.5 z-10 rounded-md border px-1 text-xs font-semibold transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-warm"
                                : "border-primary/30 bg-primary-light text-primary-dark hover:border-primary hover:bg-primary hover:text-primary-foreground",
                            )}
                            style={{
                              top: top + 2,
                              height: AGENDA_SLOT_HEIGHT_PX - 4,
                            }}
                          >
                            {slot}
                          </button>
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
