"use client";

import type { Professional } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

type ProfessionalSlotMobileListProps = {
  professionals: Professional[];
  slotsByProfessional: Record<string, string[]>;
  loading?: boolean;
  selectedProfessionalId?: string;
  selectedTime?: string;
  onSelect: (professionalId: string, time: string) => void;
};

export function ProfessionalSlotMobileList({
  professionals,
  slotsByProfessional,
  loading = false,
  selectedProfessionalId,
  selectedTime,
  onSelect,
}: ProfessionalSlotMobileListProps) {
  const activeProfessionals = professionals.filter((p) => p.active);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
        Carregando horários...
      </div>
    );
  }

  if (activeProfessionals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        Nenhum profissional disponível.
      </div>
    );
  }

  const hasAnySlot = activeProfessionals.some(
    (p) => (slotsByProfessional[p.id]?.length ?? 0) > 0,
  );

  if (!hasAnySlot) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        Nenhum horário neste dia. Escolha outra data acima.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeProfessionals.map((professional) => {
        const slots = slotsByProfessional[professional.id] ?? [];
        if (slots.length === 0) return null;

        return (
          <section
            key={professional.id}
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-warm"
          >
            <h3 className="font-display text-base font-semibold text-foreground">
              {professional.name}
            </h3>
            {professional.specialty && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {professional.specialty}
              </p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected =
                  selectedProfessionalId === professional.id &&
                  selectedTime === slot;

                return (
                  <button
                    key={`${professional.id}-${slot}`}
                    type="button"
                    onClick={() => onSelect(professional.id, slot)}
                    aria-pressed={isSelected}
                    aria-label={`${professional.name}, ${slot}`}
                    className={cn(
                      "flex min-h-11 items-center justify-center rounded-xl border text-sm font-semibold transition-all active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-warm"
                        : "border-border bg-muted/50 text-foreground hover:border-primary/40 hover:bg-primary-light",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
