"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Availability, Professional, Service } from "@prisma/client";
import {
  advanceOnboardingStep,
  completeOnboarding,
} from "@/lib/actions/organization";
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
  services: Service[];
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
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium ${
              i <= currentStep
                ? "bg-teal-100 text-teal-800"
                : "bg-slate-100 text-slate-400"
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
            <p className="text-slate-600">
              Vamos configurar seu negócio em poucos passos. Você terá 14 dias
              gratuitos para explorar todas as funcionalidades.
            </p>
            <Button onClick={() => goToStep(1)}>Começar configuração</Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Cadastre seus serviços
          </h2>
          {services.length === 0 ? (
            <ServiceForm redirectTo="/onboarding" />
          ) : (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-600">
                  {services.length} serviço(s) cadastrado(s).
                </p>
              </CardContent>
            </Card>
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
          <h2 className="text-lg font-semibold text-slate-900">
            Cadastre seus profissionais
          </h2>
          {professionals.length === 0 ? (
            <ProfessionalForm redirectTo="/onboarding" />
          ) : (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-600">
                  {professionals.length} profissional(is) cadastrado(s).
                </p>
              </CardContent>
            </Card>
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
          <h2 className="text-lg font-semibold text-slate-900">
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
