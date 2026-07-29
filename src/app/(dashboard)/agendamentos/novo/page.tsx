import Link from "next/link";
import { requireSessionContext } from "@/lib/tenant/context";
import { getClients } from "@/lib/queries/clients";
import {
  getProfessionals,
  getProfessionalServiceMap,
} from "@/lib/queries/professionals";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { Users, Scissors, UserCog } from "lucide-react";

type PageProps = {
  searchParams: Promise<{
    data?: string;
    profissional?: string;
    hora?: string;
  }>;
};

export default async function NovoAgendamentoPage({ searchParams }: PageProps) {
  const ctx = await requireSessionContext();
  const params = await searchParams;
  const [clients, professionals, services, professionalServiceMap] =
    await Promise.all([
      getClients(ctx.organizationId),
      getProfessionals(ctx.organizationId, true),
      getServices(ctx.organizationId, true),
      getProfessionalServiceMap(ctx.organizationId),
    ]);

  const missing: { label: string; href: string; icon: typeof Users }[] = [];
  if (services.length === 0) {
    missing.push({ label: "Cadastrar serviço", href: "/servicos/novo", icon: Scissors });
  }
  if (professionals.length === 0) {
    missing.push({
      label: "Cadastrar profissional",
      href: "/profissionais/novo",
      icon: UserCog,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo agendamento"
        description="Agende um atendimento para um cliente"
      />
      {missing.length > 0 ? (
        <EmptyState
          icon={Users}
          title="Antes de agendar, complete o cadastro"
          description="Para criar um agendamento, você precisa ter pelo menos um serviço e um profissional ativo. Clientes podem ser cadastrados durante o agendamento."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {missing.map((item) => (
                <Button key={item.href} variant="outline" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>
          }
        />
      ) : (
        <AppointmentForm
          clients={clients}
          professionals={professionals}
          services={services}
          professionalServiceMap={professionalServiceMap}
          initialDate={params.data}
          initialProfessionalId={params.profissional}
          initialTime={params.hora}
        />
      )}
    </div>
  );
}
