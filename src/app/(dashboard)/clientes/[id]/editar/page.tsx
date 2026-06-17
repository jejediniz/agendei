import { notFound } from "next/navigation";
import { requireSessionContext } from "@/lib/tenant/context";
import { getClientById } from "@/lib/queries/clients";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarClientePage({ params }: PageProps) {
  const ctx = await requireSessionContext();
  const { id } = await params;
  const client = await getClientById(ctx.organizationId, id);

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar cliente"
        description={`Editando: ${client.name}`}
      />
      <ClientForm
        clientId={client.id}
        defaultValues={{
          name: client.name,
          phone: client.phone,
          email: client.email ?? "",
          document: client.document ?? "",
          notes: client.notes ?? "",
        }}
      />
    </div>
  );
}
