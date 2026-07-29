import { requireSessionContext } from "@/lib/tenant/context";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalForm } from "@/components/professionals/professional-form";

export default async function NovoProfissionalPage() {
  const ctx = await requireSessionContext();
  const services = await getServices(ctx.organizationId, true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo profissional"
        description="Cadastre um novo profissional"
      />
      <ProfessionalForm services={services} />
    </div>
  );
}
