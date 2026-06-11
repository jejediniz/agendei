import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalForm } from "@/components/professionals/professional-form";

export default function NovoProfissionalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo profissional"
        description="Cadastre um novo profissional"
      />
      <ProfessionalForm />
    </div>
  );
}
