import { notFound } from "next/navigation";
import { requireSessionContext } from "@/lib/tenant/context";
import {
  getProfessionalById,
  getProfessionalServiceIds,
} from "@/lib/queries/professionals";
import { getServices } from "@/lib/queries/services";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalForm } from "@/components/professionals/professional-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProfissionalPage({ params }: PageProps) {
  const ctx = await requireSessionContext();
  const { id } = await params;
  const [professional, services, serviceIds] = await Promise.all([
    getProfessionalById(ctx.organizationId, id),
    getServices(ctx.organizationId, true),
    getProfessionalServiceIds(ctx.organizationId, id),
  ]);

  if (!professional) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar profissional"
        description={`Editando: ${professional.name}`}
      />
      <ProfessionalForm
        professionalId={professional.id}
        services={services}
        defaultValues={{
          name: professional.name,
          phone: professional.phone ?? "",
          email: professional.email ?? "",
          specialty: professional.specialty ?? "",
          active: professional.active,
          serviceIds,
        }}
      />
    </div>
  );
}
