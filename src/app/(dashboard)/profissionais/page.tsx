import { requireSessionContext } from "@/lib/tenant/context";
import { getProfessionals } from "@/lib/queries/professionals";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalTable } from "@/components/professionals/professional-table";

export default async function ProfissionaisPage() {
  const ctx = await requireSessionContext();
  const professionals = await getProfessionals(ctx.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Organize sua equipe e quem atende cada serviço"
        actionLabel="Novo profissional"
        actionHref="/profissionais/novo"
      />
      <ProfessionalTable professionals={professionals} />
    </div>
  );
}
