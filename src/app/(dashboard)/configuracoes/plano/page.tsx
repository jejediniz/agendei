import Link from "next/link";
import { requireSuperAdmin } from "@/lib/tenant/context";
import { getOrganizationById } from "@/lib/queries/organizations";
import { getSubscriptionPrice } from "@/lib/billing/asaas";
import { PageHeader } from "@/components/layout/page-header";
import { PlanPanel } from "@/components/billing/plan-panel";

export default async function ConfiguracoesPlanoPage() {
  const ctx = await requireSuperAdmin();
  const org = await getOrganizationById(ctx.organizationId);

  if (!org) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar informações do plano.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plano e assinatura"
        description="Gerencie sua assinatura do Agendei"
      />
      <PlanPanel
        status={org.subscriptionStatus}
        trialEndsAt={org.trialEndsAt}
        price={getSubscriptionPrice()}
      />
      <p className="text-sm text-muted-foreground">
        <Link href="/configuracoes/negocio" className="text-primary hover:underline">
          ← Voltar às configurações do negócio
        </Link>
      </p>
    </div>
  );
}
