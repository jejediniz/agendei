import Link from "next/link";
import { requireSessionContext } from "@/lib/tenant/context";
import { getClients } from "@/lib/queries/clients";
import { getProfessionals } from "@/lib/queries/professionals";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { Users, Scissors, UserCog } from "lucide-react";

export default async function NovoAgendamentoPage() {
  const ctx = await requireSessionContext();
  const [clients, professionals, services] = await Promise.all([
    getClients(ctx.organizationId),
    getProfessionals(ctx.organizationId, true),
    getServices(ctx.organizationId, true),
  ]);

  const missing: { label: string; href: string; icon: typeof Users }[] = [];
  if (clients.length === 0) {
    missing.push({ label: "Cadastrar cliente", href: "/clientes/novo", icon: Users });
  }
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
          description="Você precisa ter pelo menos um cliente, um serviço e um profissional ativo."
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
        />
      )}
    </div>
  );
}
