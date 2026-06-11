import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/tenant/context";
import { getOrganizationById } from "@/lib/queries/organizations";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformTrialActions } from "@/components/platform/platform-trial-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformOrgPage({ params }: PageProps) {
  await requirePlatformAdmin();
  const { id } = await params;
  const org = await getOrganizationById(id);

  if (!org) notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/platform">← Voltar</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{org.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Slug:</strong> {org.slug}</p>
            <p><strong>Status:</strong> {org.subscriptionStatus}</p>
            <p><strong>Tipo:</strong> {org.businessType}</p>
            {org.trialEndsAt && (
              <p><strong>Trial até:</strong> {formatDateTime(org.trialEndsAt)}</p>
            )}
            <p><strong>Criado em:</strong> {formatDate(org.createdAt)}</p>
            {org.asaasCustomerId && (
              <p><strong>Asaas Customer:</strong> {org.asaasCustomerId}</p>
            )}
          </CardContent>
        </Card>

        <PlatformTrialActions organizationId={org.id} />
      </div>
    </div>
  );
}
