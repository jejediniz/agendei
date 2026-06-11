import { Suspense } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireSessionContext } from "@/lib/tenant/context";
import { getAppointments } from "@/lib/queries/appointments";
import { getProfessionals } from "@/lib/queries/professionals";
import { PageHeader } from "@/components/layout/page-header";
import { AgendaFilters } from "@/components/agenda/agenda-filters";
import { DayTimeline } from "@/components/agenda/day-timeline";

type PageProps = {
  searchParams: Promise<{ data?: string; profissional?: string }>;
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const ctx = await requireSessionContext();
  const params = await searchParams;
  const date = params.data ?? format(new Date(), "yyyy-MM-dd");
  const dateLabel = format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const [appointments, professionals] = await Promise.all([
    getAppointments(ctx.organizationId, {
      date,
      professionalId: params.profissional,
    }),
    getProfessionals(ctx.organizationId),
  ]);

  const filtered = appointments.filter((a) => a.status !== "CANCELLED");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda do dia"
        description="Visualização dos agendamentos em formato de agenda"
      />
      <Suspense>
        <AgendaFilters professionals={professionals} />
      </Suspense>
      <DayTimeline appointments={filtered} dateLabel={dateLabel} />
    </div>
  );
}
