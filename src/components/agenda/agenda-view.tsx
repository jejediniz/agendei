"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Professional, Availability } from "@prisma/client";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import type { AgendaViewMode } from "@/lib/constants/agenda";
import {
  getWeekDays,
  getMonthGridDays,
  toDateKey,
} from "@/lib/utils/date";
import { AgendaToolbar } from "@/components/agenda/agenda-toolbar";
import { ProfessionalDayGrid } from "@/components/agenda/professional-day-grid";
import { AgendaWeekGrid } from "@/components/agenda/agenda-week-grid";
import { AgendaMonthGrid } from "@/components/agenda/agenda-month-grid";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";

type AgendaViewProps = {
  professionals: Professional[];
  appointments: AppointmentWithRelations[];
  availabilities: Availability[];
  date: string;
  view: AgendaViewMode;
};

export function AgendaView({
  professionals,
  appointments,
  availabilities,
  date,
  view,
}: AgendaViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightProfessionalId = searchParams.get("profissional") ?? undefined;
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  const todayKey = toDateKey(new Date());

  function updateProfessionalFilter(professionalId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (professionalId) params.set("profissional", professionalId);
    else params.delete("profissional");
    router.replace(`/agenda?${params.toString()}`);
  }

  function goToDay(day: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", day);
    params.set("vista", "dia");
    router.replace(`/agenda?${params.toString()}`);
  }

  function quickCreate(professionalId: string, time: string) {
    const params = new URLSearchParams({
      data: date,
      profissional: professionalId,
      hora: time,
    });
    router.push(`/agendamentos/novo?${params.toString()}`);
  }

  // Semana/mês filtram por profissional no cliente (a visão de dia tem seu
  // próprio seletor de colunas).
  const filteredForRange = highlightProfessionalId
    ? appointments.filter((a) => a.professionalId === highlightProfessionalId)
    : appointments;

  return (
    <div className="space-y-4">
      <AgendaToolbar />

      {view === "dia" && (
        <ProfessionalDayGrid
          professionals={professionals}
          appointments={appointments}
          availabilities={availabilities}
          date={date}
          highlightProfessionalId={highlightProfessionalId}
          onProfessionalFilter={updateProfessionalFilter}
          onAppointmentClick={setSelectedAppointment}
          onSlotClick={quickCreate}
        />
      )}

      {view === "semana" && (
        <AgendaWeekGrid
          weekDays={getWeekDays(date)}
          appointments={filteredForRange}
          todayKey={todayKey}
          onAppointmentClick={setSelectedAppointment}
          onDaySelect={goToDay}
        />
      )}

      {view === "mes" && (
        <AgendaMonthGrid
          monthDays={getMonthGridDays(date)}
          appointments={filteredForRange}
          todayKey={todayKey}
          onDaySelect={goToDay}
        />
      )}

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={selectedAppointment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
