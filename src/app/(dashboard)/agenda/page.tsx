import { Suspense } from "react";
import { format } from "date-fns";
import { requireSessionContext } from "@/lib/tenant/context";
import { getAppointments } from "@/lib/queries/appointments";
import { getProfessionals } from "@/lib/queries/professionals";
import { getAvailabilitiesByProfessional } from "@/lib/queries/availability";
import { PageHeader } from "@/components/layout/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";

type PageProps = {
  searchParams: Promise<{ data?: string; profissional?: string }>;
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const ctx = await requireSessionContext();
  const params = await searchParams;
  const date = params.data ?? format(new Date(), "yyyy-MM-dd");

  const [appointments, professionals, availabilities] = await Promise.all([
    getAppointments(ctx.organizationId, { date }),
    getProfessionals(ctx.organizationId),
    getAvailabilitiesByProfessional(ctx.organizationId),
  ]);

  const filtered = appointments.filter((a) => a.status !== "CANCELLED");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description="Visão do dia por profissional — toque em um horário para ver na lista"
      />
      <Suspense>
        <AgendaView
          professionals={professionals}
          appointments={filtered}
          availabilities={availabilities}
          date={date}
        />
      </Suspense>
    </div>
  );
}
