"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { AccountType } from "@prisma/client";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Professional } from "@prisma/client";
import type { SerializableService } from "@/lib/queries/services";
import type { PublicOrganization } from "@/lib/queries/public-booking";
import {
  publicBookingSchema,
  type PublicBookingFormData,
} from "@/lib/validations/public-booking";
import {
  createPublicBooking,
  getPublicAvailableSlots,
} from "@/lib/actions/public-booking";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime, combineDateAndTime } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AgendaWeekStrip } from "@/components/agenda/agenda-week-strip";
import { ProfessionalSlotTimeGrid } from "@/components/booking/professional-slot-time-grid";
import { cn } from "@/lib/utils/cn";

type CustomerSession = {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
} | null;

type PublicBookingWizardProps = {
  organization: PublicOrganization;
  services: SerializableService[];
  professionals: Professional[];
  professionalServiceMap?: Record<string, string[]>;
  customerSession?: CustomerSession;
};

const STEPS = ["Serviço", "Data e horário", "Seus dados"];

const EMPTY_SERVICE_MAP: Record<string, string[]> = {};

// Profissional com vínculos só atende os serviços que realiza
// (sem vínculos = atende todos, retrocompatível).
function professionalOffersService(
  map: Record<string, string[]>,
  professionalId: string,
  serviceId: string,
): boolean {
  const ids = map[professionalId];
  if (!ids || ids.length === 0) return true;
  return ids.includes(serviceId);
}

export function PublicBookingWizard({
  organization,
  services,
  professionals,
  professionalServiceMap = EMPTY_SERVICE_MAP,
  customerSession = null,
}: PublicBookingWizardProps) {
  const { data: session } = useSession();
  const isCustomerLoggedIn =
    session?.user?.accountType === AccountType.CUSTOMER;
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotsByProfessional, setSlotsByProfessional] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    serviceName: string;
    professionalName: string;
    startAt: Date;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<PublicBookingFormData>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: {
      slug: organization.slug,
      serviceId: "",
      professionalId: "",
      date: "",
      time: "",
      clientName: customerSession?.name ?? "",
      clientPhone: "",
      clientEmail: customerSession?.email ?? "",
      notes: "",
    },
  });

  useEffect(() => {
    if (customerSession?.name) {
      setValue("clientName", customerSession.name);
    }
  }, [customerSession, setValue]);

  const serviceId = watch("serviceId");
  const professionalId = watch("professionalId");
  const date = watch("date");
  const time = watch("time");

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedProfessional = professionals.find((p) => p.id === professionalId);
  const eligibleProfessionals = serviceId
    ? professionals.filter(
        (p) =>
          p.active &&
          professionalOffersService(professionalServiceMap, p.id, serviceId),
      )
    : professionals.filter((p) => p.active);

  useEffect(() => {
    async function loadSlots() {
      if (!serviceId || !date) {
        setSlotsByProfessional({});
        return;
      }
      setLoadingSlots(true);
      const results = await Promise.all(
        professionals
          .filter(
            (p) =>
              p.active &&
              professionalOffersService(
                professionalServiceMap,
                p.id,
                serviceId,
              ),
          )
          .map(async (professional) => {
            const result = await getPublicAvailableSlots(
              organization.slug,
              professional.id,
              serviceId,
              date,
            );
            return { professionalId: professional.id, slots: result.slots, error: result.error };
          }),
      );
      setLoadingSlots(false);

      const map: Record<string, string[]> = {};
      for (const result of results) {
        map[result.professionalId] = result.slots;
      }
      setSlotsByProfessional(map);

      const firstError = results.find((r) => r.error && r.slots.length === 0)?.error;
      if (firstError && results.every((r) => r.slots.length === 0)) {
        toast.error(firstError);
      }

      if (
        professionalId &&
        time &&
        !(map[professionalId]?.includes(time))
      ) {
        setValue("professionalId", "");
        setValue("time", "");
      }
    }
    loadSlots();
  }, [
    serviceId,
    date,
    organization.slug,
    professionals,
    professionalServiceMap,
    setValue,
    professionalId,
    time,
  ]);

  async function goNext() {
    if (step === 0) {
      const valid = await trigger("serviceId");
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await trigger(["date", "time", "professionalId"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: PublicBookingFormData) {
    setLoading(true);
    const result = await createPublicBooking(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao agendar.");
      return;
    }

    const startAt = combineDateAndTime(data.date, data.time);
    setConfirmation({
      serviceName: selectedService?.name ?? "",
      professionalName: selectedProfessional?.name ?? "",
      startAt,
    });
    setCompleted(true);
  }

  if (completed && confirmation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Agendamento realizado!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {confirmation.serviceName} com {confirmation.professionalName}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatDateTime(confirmation.startAt)}
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Guarde este horário. Use o mesmo e-mail informado no agendamento para
            acompanhar ou cancelar depois.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {isCustomerLoggedIn ? (
              <Button asChild>
                <Link href={`/${organization.slug}/meus-agendamentos`}>
                  Ver meus agendamentos
                </Link>
              </Button>
            ) : (
              <GoogleSignInButton
                intent="customer"
                callbackUrl={`/${organization.slug}/meus-agendamentos`}
                label="Entrar com Google para acompanhar"
              />
            )}
            <Button
              variant="outline"
              onClick={() => {
                setCompleted(false);
                setConfirmation(null);
                setStep(0);
                setValue("serviceId", "");
                setValue("professionalId", "");
                setValue("date", "");
                setValue("time", "");
                setValue("clientName", customerSession?.name ?? "");
                setValue("clientPhone", "");
                setValue("notes", "");
              }}
            >
              Fazer outro agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium",
              i <= step
                ? "bg-primary-light text-primary-dark"
                : "bg-muted text-muted-foreground/60",
            )}
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{i + 1}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 0 && (
              <div className="space-y-3">
                <Label>Escolha o serviço *</Label>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => field.onChange(service.id)}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-colors",
                            field.value === service.id
                              ? "border-primary bg-primary-light"
                              : "border-border hover:border-border",
                          )}
                        >
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {service.durationMin} min · {formatCurrency(service.price)}
                          </p>
                          {service.description && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.serviceId && (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{errors.serviceId.message}</p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <AgendaWeekStrip
                  selectedDate={date || format(new Date(), "yyyy-MM-dd")}
                  onDateChange={(value) => {
                    setValue("date", value, { shouldValidate: true });
                    setValue("time", "");
                    setValue("professionalId", "");
                  }}
                  minDate={new Date().toISOString().split("T")[0]}
                />

                <div className="space-y-3">
                  <Label>Escolha o horário e o profissional *</Label>
                  {!date ? (
                    <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                      Selecione uma data acima para ver os horários.
                    </p>
                  ) : (
                    <ProfessionalSlotTimeGrid
                      professionals={eligibleProfessionals}
                      slotsByProfessional={slotsByProfessional}
                      loading={loadingSlots}
                      selectedProfessionalId={professionalId}
                      selectedTime={time}
                      onSelect={(proId, slot) => {
                        setValue("professionalId", proId, { shouldValidate: true });
                        setValue("time", slot, { shouldValidate: true });
                      }}
                    />
                  )}
                  {errors.date && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{errors.date.message}</p>
                  )}
                  {errors.professionalId && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      {errors.professionalId.message}
                    </p>
                  )}
                  {errors.time && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{errors.time.message}</p>
                  )}
                </div>

                {selectedService && (
                  <p className="text-sm text-muted-foreground">
                    {selectedService.name} · {selectedService.durationMin} min ·{" "}
                    {formatCurrency(selectedService.price)}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Revise seu agendamento
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted-foreground">Serviço</dt>
                      <dd className="text-right font-medium text-foreground">
                        {selectedService?.name ?? "—"}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted-foreground">Profissional</dt>
                      <dd className="text-right font-medium text-foreground">
                        {selectedProfessional?.name ?? "—"}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted-foreground">Data e horário</dt>
                      <dd className="text-right font-medium text-foreground">
                        {date && time
                          ? formatDateTime(combineDateAndTime(date, time))
                          : "—"}
                      </dd>
                    </div>
                    {selectedService && (
                      <>
                        <div className="flex items-baseline justify-between gap-4">
                          <dt className="text-muted-foreground">Duração</dt>
                          <dd className="text-right font-medium text-foreground">
                            {selectedService.durationMin} min
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 border-t border-border/60 pt-2">
                          <dt className="text-muted-foreground">Valor</dt>
                          <dd className="text-right font-semibold text-primary">
                            {formatCurrency(selectedService.price)}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                  <p className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    Precisa cancelar? Você poderá fazer isso por aqui até o
                    horário do atendimento
                    {organization.phone
                      ? `, ou fale com ${organization.name}: ${organization.phone}.`
                      : "."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Seu nome *</Label>
                    <Input id="clientName" {...register("clientName")} />
                    {errors.clientName && (
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {errors.clientName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone *</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      {...register("clientPhone")}
                    />
                    {errors.clientPhone && (
                      <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
                        {errors.clientPhone.message}
                      </p>
                    )}
                  </div>
                  {!isCustomerLoggedIn && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="clientEmail">E-mail *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("clientEmail")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Usaremos este e-mail para você acompanhar seus agendamentos.
                      </p>
                      {errors.clientEmail && (
                        <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
                          {errors.clientEmail.message}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea id="notes" rows={2} {...register("notes")} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || loading}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="w-full sm:w-auto"
                >
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Agendando..." : "Confirmar agendamento"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
