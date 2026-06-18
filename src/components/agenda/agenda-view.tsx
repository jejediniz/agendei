"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Professional, Availability } from "@prisma/client";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { AgendaToolbar } from "@/components/agenda/agenda-toolbar";
import { ProfessionalDayGrid } from "@/components/agenda/professional-day-grid";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";

type AgendaViewProps = {
  professionals: Professional[];
  appointments: AppointmentWithRelations[];
  availabilities: Availability[];
  date: string;
};

export function AgendaView({
  professionals,
  appointments,
  availabilities,
  date,
}: AgendaViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightProfessionalId = searchParams.get("profissional") ?? undefined;
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  function updateProfessionalFilter(professionalId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (professionalId) params.set("profissional", professionalId);
    else params.delete("profissional");
    router.replace(`/agenda?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <AgendaToolbar />
      <ProfessionalDayGrid
        professionals={professionals}
        appointments={appointments}
        availabilities={availabilities}
        date={date}
        highlightProfessionalId={highlightProfessionalId}
        onProfessionalFilter={updateProfessionalFilter}
        onAppointmentClick={setSelectedAppointment}
      />
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
