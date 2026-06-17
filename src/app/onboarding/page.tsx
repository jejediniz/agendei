import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServices } from "@/lib/queries/services";
import { getProfessionals } from "@/lib/queries/professionals";
import { getAvailabilitiesByProfessional } from "@/lib/queries/availability";
import { getPrimaryMembershipForSession } from "@/lib/queries/membership";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { OrganizationSetupForm } from "@/components/onboarding/organization-setup-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getPrimaryMembershipForSession();

  if (!membership) {
    return (
      <div className="min-h-screen bg-background p-4 py-12 lg:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-primary">Agendei</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Olá, {session.user.name ?? session.user.email}! Falta pouco para começar.
          </p>
        </div>
        <OrganizationSetupForm />
      </div>
    );
  }

  const organizationId = membership.organizationId;
  const org = membership.organization;

  const [services, professionals, availabilities] = await Promise.all([
    getServices(organizationId),
    getProfessionals(organizationId),
    getAvailabilitiesByProfessional(organizationId),
  ]);

  // Se já estiver concluído no banco, não faz sentido ficar preso no onboarding.
  // Usamos `onboardingCompletedAt` (e não só `onboardingStep`) para reduzir loops
  // quando a sessão/token ainda estiver "stale".
  if (org.onboardingCompletedAt) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background p-4 py-12 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary">Agendei</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configuração inicial</p>
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
