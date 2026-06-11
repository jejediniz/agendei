import { getClients } from "@/lib/queries/clients";
import { getProfessionals } from "@/lib/queries/professionals";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default async function NovoAgendamentoPage() {
  const [clients, professionals, services] = await Promise.all([
    getClients(),
    getProfessionals(true),
    getServices(true),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo agendamento"
        description="Agende um atendimento para um cliente"
      />
      <AppointmentForm
        clients={clients}
        professionals={professionals}
        services={services}
      />
    </div>
  );
}
