import { getProfessionals } from "@/lib/queries/professionals";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalTable } from "@/components/professionals/professional-table";

export default async function ProfissionaisPage() {
  const professionals = await getProfessionals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Gerencie a equipe de atendimento"
        actionLabel="Novo profissional"
        actionHref="/profissionais/novo"
      />
      <ProfessionalTable professionals={professionals} />
    </div>
  );
}
