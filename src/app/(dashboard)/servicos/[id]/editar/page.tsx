import { notFound } from "next/navigation";
import { requireSessionContext } from "@/lib/tenant/context";
import { getServiceById } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { ServiceForm } from "@/components/services/service-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarServicoPage({ params }: PageProps) {
  const ctx = await requireSessionContext();
  const { id } = await params;
  const service = await getServiceById(ctx.organizationId, id);

  if (!service) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar serviço"
        description={`Editando: ${service.name}`}
      />
      <ServiceForm
        serviceId={service.id}
        defaultValues={{
          name: service.name,
          description: service.description ?? "",
          durationMin: service.durationMin,
          bufferMin: service.bufferMin,
          price: service.price,
          active: service.active,
        }}
      />
    </div>
  );
}
