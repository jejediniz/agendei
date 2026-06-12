import { requireSuperAdmin } from "@/lib/tenant/context";
import { getOrganizationById } from "@/lib/queries/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { OrganizationForm } from "@/components/settings/organization-form";
import { BookingLinkCard } from "@/components/settings/booking-link-card";

export default async function ConfiguracoesNegocioPage() {
  const ctx = await requireSuperAdmin();
  const org = await getOrganizationById(ctx.organizationId);

  if (!org) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações do negócio"
        description="Dados do seu estabelecimento"
      />
      <BookingLinkCard slug={org.slug} />
      <OrganizationForm
        defaultValues={{
          name: org.name,
          businessType: org.businessType,
          phone: org.phone ?? "",
          email: org.email ?? "",
          logoUrl: org.logoUrl ?? "",
        }}
      />
    </div>
  );
}
