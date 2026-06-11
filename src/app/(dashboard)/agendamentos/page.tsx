import { Suspense } from "react";
import { AppointmentStatus } from "@prisma/client";
import { getAppointments } from "@/lib/queries/appointments";
import { getProfessionals } from "@/lib/queries/professionals";
import { PageHeader } from "@/components/layout/page-header";
import { AppointmentFilters } from "@/components/appointments/appointment-filters";
import { AppointmentTable } from "@/components/appointments/appointment-table";

type PageProps = {
  searchParams: Promise<{
    data?: string;
    profissional?: string;
    status?: string;
  }>;
};

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [appointments, professionals] = await Promise.all([
    getAppointments({
      date: params.data,
      professionalId: params.profissional,
      status: params.status as AppointmentStatus | undefined,
    }),
    getProfessionals(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agendamentos"
        description="Visualize e gerencie os agendamentos"
        actionLabel="Novo agendamento"
        actionHref="/agendamentos/novo"
      />
      <Suspense>
        <AppointmentFilters professionals={professionals} />
      </Suspense>
      <AppointmentTable appointments={appointments} />
    </div>
  );
}
