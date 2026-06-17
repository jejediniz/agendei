"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { AgendaWeekStrip } from "@/components/agenda/agenda-week-strip";
import { Button } from "@/components/ui/button";

export function AgendaToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = searchParams.get("data") ?? format(new Date(), "yyyy-MM-dd");

  function updateDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", value);
    router.replace(`/agenda?${params.toString()}`);
  }

  function goToToday() {
    updateDate(format(new Date(), "yyyy-MM-dd"));
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-warm">
      <AgendaWeekStrip selectedDate={currentDate} onDateChange={updateDate} />
      <div className="mt-4 flex justify-center">
        <Button type="button" variant="outline" size="sm" onClick={goToToday}>
          Hoje
        </Button>
      </div>
    </div>
  );
}
