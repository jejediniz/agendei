import { Suspense } from "react";
import { getClients } from "@/lib/queries/clients";
import { PageHeader } from "@/components/layout/page-header";
import { ClientSearch } from "@/components/clients/client-search";
import { ClientTable } from "@/components/clients/client-table";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClientesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes do estabelecimento"
        actionLabel="Novo cliente"
        actionHref="/clientes/novo"
      />
      <Suspense>
        <ClientSearch />
      </Suspense>
      <ClientTable clients={clients} />
    </div>
  );
}
