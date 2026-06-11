import { requireSessionContext } from "@/lib/tenant/context";
import { getProfessionals } from "@/lib/queries/professionals";
import { getAvailabilitiesByProfessional } from "@/lib/queries/availability";
import { PageHeader } from "@/components/layout/page-header";
import { AvailabilityManager } from "@/components/availability/availability-manager";

type PageProps = {
  searchParams: Promise<{ profissional?: string }>;
};

export default async function HorariosPage({ searchParams }: PageProps) {
  const ctx = await requireSessionContext();
  const { profissional } = await searchParams;
  const [professionals, availabilities] = await Promise.all([
    getProfessionals(ctx.organizationId),
    getAvailabilitiesByProfessional(ctx.organizationId, profissional),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horários disponíveis"
        description="Defina os dias e horários de atendimento por profissional"
      />
      <AvailabilityManager
        professionals={professionals}
        availabilities={availabilities}
        selectedProfessionalId={profissional}
      />
    </div>
  );
}
