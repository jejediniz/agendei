"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AGENDA_VIEW_MODES,
  AGENDA_VIEW_LABELS,
  parseAgendaView,
  type AgendaViewMode,
} from "@/lib/constants/agenda";
import {
  addDaysToDateStr,
  addMonthsToDateStr,
  formatDateKey,
  getWeekDays,
} from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function rangeLabel(view: AgendaViewMode, date: string): string {
  if (view === "dia") {
    return formatDateKey(date, "EEEE, dd 'de' MMMM");
  }
  if (view === "semana") {
    const days = getWeekDays(date);
    return `${formatDateKey(days[0], "dd/MM")} – ${formatDateKey(days[6], "dd/MM")}`;
  }
  return formatDateKey(date, "MMMM 'de' yyyy");
}

export function AgendaToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate =
    searchParams.get("data") ?? format(new Date(), "yyyy-MM-dd");
  const view = parseAgendaView(searchParams.get("vista") ?? undefined);

  function updateParams(next: { data?: string; vista?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.data) params.set("data", next.data);
    if (next.vista) params.set("vista", next.vista);
    router.replace(`/agenda?${params.toString()}`);
  }

  function step(direction: -1 | 1) {
    if (view === "mes") {
      updateParams({ data: addMonthsToDateStr(currentDate, direction) });
    } else {
      updateParams({
        data: addDaysToDateStr(currentDate, direction * (view === "semana" ? 7 : 1)),
      });
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-warm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => step(-1)}
          aria-label="Período anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => step(1)}
          aria-label="Próximo período"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => updateParams({ data: format(new Date(), "yyyy-MM-dd") })}
        >
          Hoje
        </Button>
        <span className="ml-1 truncate font-display text-sm font-semibold capitalize text-foreground sm:text-base">
          {rangeLabel(view, currentDate)}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Modo de visualização"
        className="inline-flex items-center gap-1 self-start rounded-xl border border-border/60 bg-muted/50 p-1 sm:self-auto"
      >
        {AGENDA_VIEW_MODES.map((mode) => {
          const isActive = view === mode;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => updateParams({ vista: mode })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-card text-foreground shadow-warm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {AGENDA_VIEW_LABELS[mode]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
