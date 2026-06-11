import { notFound } from "next/navigation";
import { getProfessionalById } from "@/lib/queries/professionals";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalForm } from "@/components/professionals/professional-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProfissionalPage({ params }: PageProps) {
  const { id } = await params;
  const professional = await getProfessionalById(id);

  if (!professional) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar profissional"
        description={`Editando: ${professional.name}`}
      />
      <ProfessionalForm
        professionalId={professional.id}
        defaultValues={{
          name: professional.name,
          phone: professional.phone ?? "",
          email: professional.email ?? "",
          specialty: professional.specialty ?? "",
          active: professional.active,
        }}
      />
    </div>
  );
}
