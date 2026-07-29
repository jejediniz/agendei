import { Suspense } from "react";
import { format } from "date-fns";
import { requireSessionContext } from "@/lib/tenant/context";
import {
  getAppointments,
  getAppointmentsInRange,
  type AppointmentWithRelations,
} from "@/lib/queries/appointments";
import { getProfessionals } from "@/lib/queries/professionals";
import { getAvailabilitiesByProfessional } from "@/lib/queries/availability";
import { getWeekRange, getMonthGridRange } from "@/lib/utils/date";
import { parseAgendaView } from "@/lib/constants/agenda";
import { PageHeader } from "@/components/layout/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";
import { AgendaSectionTabs } from "@/components/agenda/agenda-section-tabs";

type PageProps = {
  searchParams: Promise<{
    data?: string;
    vista?: string;
    profissional?: string;
  }>;
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const ctx = await requireSessionContext();
  const params = await searchParams;
  const date = params.data ?? format(new Date(), "yyyy-MM-dd");
  const view = parseAgendaView(params.vista);

  const [professionals, availabilities] = await Promise.all([
    getProfessionals(ctx.organizationId),
    getAvailabilitiesByProfessional(ctx.organizationId),
  ]);

  let appointments: AppointmentWithRelations[];
  if (view === "dia") {
    const all = await getAppointments(ctx.organizationId, { date });
    appointments = all.filter((a) => a.status !== "CANCELLED");
  } else {
    const { start, end } =
      view === "semana" ? getWeekRange(date) : getMonthGridRange(date);
    appointments = await getAppointmentsInRange(
      ctx.organizationId,
      start,
      end,
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description="Calendário de atendimentos — dia, semana ou mês"
        actionLabel="Novo agendamento"
        actionHref="/agendamentos/novo"
      />
      <AgendaSectionTabs />
      <Suspense>
        <AgendaView
          professionals={professionals}
          appointments={appointments}
          availabilities={availabilities}
          date={date}
          view={view}
        />
      </Suspense>
    </div>
  );
}
