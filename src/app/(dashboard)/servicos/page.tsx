import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { ServiceTable } from "@/components/services/service-table";

export default async function ServicosPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serviços"
        description="Gerencie os serviços oferecidos"
        actionLabel="Novo serviço"
        actionHref="/servicos/novo"
      />
      <ServiceTable services={services} />
    </div>
  );
}
