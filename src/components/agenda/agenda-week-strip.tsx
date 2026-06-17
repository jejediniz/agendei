"use client";

import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AgendaWeekStripProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  className?: string;
};

export function AgendaWeekStrip({
  selectedDate,
  onDateChange,
  minDate,
  className,
}: AgendaWeekStripProps) {
  const selected = parseISO(selectedDate);
  const min = minDate ? parseISO(minDate) : undefined;

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  }, [selectedDate]);

  const monthLabel = format(selected, "MMMM", { locale: ptBR });
  const dateHeadingLong = isToday(selected)
    ? `Hoje, ${format(selected, "d 'de' MMMM, yyyy", { locale: ptBR })}`
    : format(selected, "EEEE, d 'de' MMMM, yyyy", { locale: ptBR });
  const dateHeadingShort = format(selected, "d 'de' MMM, yyyy", { locale: ptBR });

  function selectDay(day: Date) {
    if (min && day < min && !isSameDay(day, min)) return;
    onDateChange(format(day, "yyyy-MM-dd"));
  }

  function shiftWeek(direction: -1 | 1) {
    const next =
      direction === -1 ? subWeeks(selected, 1) : addWeeks(selected, 1);
    if (min && next < min) return;
    onDateChange(format(next, "yyyy-MM-dd"));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {monthLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => shiftWeek(-1)}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 justify-between gap-1 overflow-x-auto px-1 pb-1">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selected);
            const isDisabled = min ? day < min && !isSameDay(day, min) : false;

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => selectDay(day)}
                className={cn(
                  "flex min-w-[44px] flex-1 flex-col items-center gap-1.5 rounded-xl py-1 transition-colors",
                  isDisabled && "cursor-not-allowed opacity-30",
                )}
                aria-selected={isSelected}
                aria-current={isSelected ? "date" : undefined}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {WEEKDAY_SHORT[index]}
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                    isSelected && "bg-primary text-primary-foreground shadow-warm",
                    !isSelected && isToday(day) && "ring-2 ring-primary/30 text-primary",
                    !isSelected && !isToday(day) && "text-foreground hover:bg-muted",
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => shiftWeek(1)}
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center font-display text-sm font-medium capitalize text-primary sm:hidden">
        {isToday(selected) ? "Hoje · " : ""}
        {dateHeadingShort}
      </p>
      <p className="hidden text-center font-display text-sm font-medium capitalize text-primary sm:block">
        {dateHeadingLong}
      </p>
    </div>
  );
}
