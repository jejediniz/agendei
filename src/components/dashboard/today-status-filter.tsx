"use client";

import type { AppointmentStatus } from "@prisma/client";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants/appointment-status";
import { cn } from "@/lib/utils/cn";

export type TodayStatusFilterValue = "all" | AppointmentStatus;

const FILTER_OPTIONS: { value: TodayStatusFilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "SCHEDULED", label: APPOINTMENT_STATUS_LABELS.SCHEDULED },
  { value: "CONFIRMED", label: APPOINTMENT_STATUS_LABELS.CONFIRMED },
  { value: "IN_PROGRESS", label: APPOINTMENT_STATUS_LABELS.IN_PROGRESS },
  { value: "COMPLETED", label: APPOINTMENT_STATUS_LABELS.COMPLETED },
  { value: "CANCELLED", label: APPOINTMENT_STATUS_LABELS.CANCELLED },
  { value: "NO_SHOW", label: APPOINTMENT_STATUS_LABELS.NO_SHOW },
];

type TodayStatusFilterProps = {
  value: TodayStatusFilterValue;
  onChange: (value: TodayStatusFilterValue) => void;
};

export function TodayStatusFilter({ value, onChange }: TodayStatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-border bg-card text-muted-foreground hover:bg-muted/60",
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
