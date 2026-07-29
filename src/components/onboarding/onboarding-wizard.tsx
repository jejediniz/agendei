"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Availability, Professional } from "@prisma/client";
import type { SerializableService } from "@/lib/queries/services";
import {
  advanceOnboardingStep,
  completeOnboarding,
} from "@/lib/actions/organization";
import { syncSessionAndNavigate } from "@/lib/auth/sync-session";
import { ServiceForm } from "@/components/services/service-form";
import { ProfessionalForm } from "@/components/professionals/professional-form";
import { AvailabilityManager } from "@/components/availability/availability-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AvailabilityWithProfessional = Availability & {
  professional: Professional;
};

type OnboardingWizardProps = {
  step: number;
  businessName: string;
  services: SerializableService[];
  professionals: Professional[];
  availabilities: AvailabilityWithProfessional[];
};

const STEPS = [
  "Bem-vindo",
  "Serviços",
  "Profissionais",
  "Horários",
];

export function OnboardingWizard({
  step,
  businessName,
  services,
  professionals,
  availabilities,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(step);
  const [loading, setLoading] = useState(false);

  async function goToStep(next: number) {
    await advanceOnboardingStep(next);
    setCurrentStep(next);
    router.refresh();
  }

  async function handleComplete() {
    setLoading(true);
    const result = await completeOnboarding();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Complete os passos obrigatórios.");
      return;
    }

    toast.success("Configuração concluída!");
    await syncSessionAndNavigate(update, "/");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium ${
              i <= currentStep
                ? "bg-primary-light text-primary-dark"
                : "bg-muted text-muted-foreground/60"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Agendei, {businessName}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vamos configurar seu negócio em poucos passos. Você terá 14 dias
              gratuitos para explorar todas as funcionalidades.
            </p>
            <Button onClick={() => goToStep(1)}>Começar configuração</Button>
          </CardContent>
        </Card>
      )}

      {currentStep >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuração concluída!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Seu negócio já está pronto. Vamos te levar ao dashboard.
            </p>
            <Button
              onClick={() => syncSessionAndNavigate(update, "/")}
              disabled={loading}
            >
              Ir para o dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Cadastre seus serviços
          </h2>
          {services.length === 0 ? (
            <ServiceForm redirectTo="/onboarding" />
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {services.length} serviço(s) cadastrado(s):{" "}
                    {services.map((s) => s.name).join(", ")}
                  </p>
                </CardContent>
              </Card>
              <ServiceForm redirectTo="/onboarding" />
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => goToStep(0)}>
              Voltar
            </Button>
            <Button onClick={() => goToStep(2)} disabled={services.length === 0}>
              Próximo
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Cadastre seus profissionais
          </h2>
          {professionals.length === 0 ? (
            <ProfessionalForm redirectTo="/onboarding" />
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {professionals.length} profissional(is) cadastrado(s):{" "}
                    {professionals.map((p) => p.name).join(", ")}
                  </p>
                </CardContent>
              </Card>
              <ProfessionalForm redirectTo="/onboarding" />
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => goToStep(1)}>
              Voltar
            </Button>
            <Button
              onClick={() => goToStep(3)}
              disabled={professionals.length === 0}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Defina horários de atendimento
          </h2>
          <AvailabilityManager
            professionals={professionals}
            availabilities={availabilities}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => goToStep(2)}>
              Voltar
            </Button>
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? "Finalizando..." : "Concluir configuração"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
