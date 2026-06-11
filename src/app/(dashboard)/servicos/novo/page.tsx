import { PageHeader } from "@/components/layout/page-header";
import { ServiceForm } from "@/components/services/service-form";

export default function NovoServicoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo serviço" description="Cadastre um novo serviço" />
      <ServiceForm />
    </div>
  );
}
