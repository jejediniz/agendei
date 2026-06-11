import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo cliente"
        description="Preencha os dados do cliente"
      />
      <ClientForm />
    </div>
  );
}
