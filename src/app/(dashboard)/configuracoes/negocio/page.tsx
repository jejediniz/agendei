import Link from "next/link";
import { requireSuperAdmin } from "@/lib/tenant/context";
import { getOrganizationById } from "@/lib/queries/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { OrganizationForm } from "@/components/settings/organization-form";
import { BookingLinkCard } from "@/components/settings/booking-link-card";

export default async function ConfiguracoesNegocioPage() {
  const ctx = await requireSuperAdmin();
  const org = await getOrganizationById(ctx.organizationId);

  if (!org) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados do negócio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações do negócio"
        description="Dados do seu estabelecimento"
      />
      <BookingLinkCard slug={org.slug} />
      <p className="text-sm text-muted-foreground">
        <Link href="/configuracoes/plano" className="text-primary hover:underline">
          Gerenciar plano e assinatura →
        </Link>
      </p>
      <OrganizationForm
        defaultValues={{
          name: org.name,
          businessType: org.businessType,
          phone: org.phone ?? "",
          email: org.email ?? "",
          logoUrl: org.logoUrl ?? "",
          slotIntervalMin: org.slotIntervalMin as 15 | 30 | 60,
        }}
      />
    </div>
  );
}
