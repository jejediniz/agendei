import { requireSessionContext } from "@/lib/tenant/context";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { ServiceTable } from "@/components/services/service-table";

export default async function ServicosPage() {
  const ctx = await requireSessionContext();
  const services = await getServices(ctx.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serviços"
        description="Configure duração, preço e disponibilidade dos serviços"
        actionLabel="Novo serviço"
        actionHref="/servicos/novo"
      />
      <ServiceTable services={services} />
    </div>
  );
}
