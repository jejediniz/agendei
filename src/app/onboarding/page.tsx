import { requireSessionContext } from "@/lib/tenant/context";
import { getOrganizationById } from "@/lib/queries/organizations";
import { getServices } from "@/lib/queries/services";
import { getProfessionals } from "@/lib/queries/professionals";
import { getAvailabilitiesByProfessional } from "@/lib/queries/availability";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const ctx = await requireSessionContext();
  const [org, services, professionals, availabilities] = await Promise.all([
    getOrganizationById(ctx.organizationId),
    getServices(ctx.organizationId),
    getProfessionals(ctx.organizationId),
    getAvailabilitiesByProfessional(ctx.organizationId),
  ]);

  if (!org) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-12 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-teal-600">Agendei</h1>
        <p className="mt-1 text-sm text-slate-500">Configuração inicial</p>
      </div>
      <OnboardingWizard
        step={org.onboardingStep}
        businessName={org.name}
        services={services}
        professionals={professionals}
        availabilities={availabilities}
      />
    </div>
  );
}
