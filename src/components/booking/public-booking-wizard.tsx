"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { AccountType } from "@prisma/client";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  customerSession?: CustomerSession;
};

const STEPS = ["Serviço", "Profissional", "Data e horário", "Seus dados"];

export function PublicBookingWizard({
  organization,
  services,
  professionals,
  customerSession = null,
}: PublicBookingWizardProps) {
  const { data: session } = useSession();
  const isCustomerLoggedIn =
    session?.user?.accountType === AccountType.CUSTOMER;
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
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

  useEffect(() => {
    async function loadSlots() {
      if (!professionalId || !serviceId || !date) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      const result = await getPublicAvailableSlots(
        organization.slug,
        professionalId,
        serviceId,
        date,
      );
      setLoadingSlots(false);
      setSlots(result.slots);
      if (result.error && result.slots.length === 0) {
        toast.error(result.error);
      }
      setValue("time", "");
    }
    loadSlots();
  }, [professionalId, serviceId, date, organization.slug, setValue]);

  async function goNext() {
    if (step === 0) {
      const valid = await trigger("serviceId");
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await trigger("professionalId");
      if (!valid) return;
    }
    if (step === 2) {
      const valid = await trigger(["date", "time"]);
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Agendamento confirmado!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {confirmation.serviceName} com {confirmation.professionalName}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formatDateTime(confirmation.startAt)}
          </p>
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            Guarde este horário. Para consultar ou cancelar depois, acesse seus
            agendamentos com Google.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {isCustomerLoggedIn ? (
              <Button asChild>
                <Link href={`/${organization.slug}/meus-agendamentos`}>
                  Ver meus agendamentos
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: `/${organization.slug}/meus-agendamentos`,
                  })
                }
              >
                Entrar com Google para acompanhar
              </Button>
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
                ? "bg-teal-100 text-teal-800"
                : "bg-slate-100 text-slate-400",
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
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <p className="font-medium text-slate-900">{service.name}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {service.durationMin} min · {formatCurrency(service.price)}
                          </p>
                          {service.description && (
                            <p className="mt-2 text-xs text-slate-500">
                              {service.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.serviceId && (
                  <p className="text-sm text-rose-600">{errors.serviceId.message}</p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Label>Escolha o profissional *</Label>
                <Controller
                  name="professionalId"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {professionals.map((professional) => (
                        <button
                          key={professional.id}
                          type="button"
                          onClick={() => field.onChange(professional.id)}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-colors",
                            field.value === professional.id
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <p className="font-medium text-slate-900">
                            {professional.name}
                          </p>
                          {professional.specialty && (
                            <p className="mt-1 text-sm text-slate-600">
                              {professional.specialty}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.professionalId && (
                  <p className="text-sm text-rose-600">
                    {errors.professionalId.message}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...register("date")}
                  />
                  {errors.date && (
                    <p className="text-sm text-rose-600">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loadingSlots || slots.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingSlots
                                ? "Carregando horários..."
                                : slots.length === 0
                                  ? "Nenhum horário disponível"
                                  : "Selecione o horário"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {slots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.time && (
                    <p className="text-sm text-rose-600">{errors.time.message}</p>
                  )}
                </div>
                {selectedService && (
                  <p className="text-sm text-slate-500 sm:col-span-2">
                    {selectedService.name} · {selectedService.durationMin} min ·{" "}
                    {formatCurrency(selectedService.price)}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-900">{selectedService?.name}</strong>{" "}
                    com {selectedProfessional?.name}
                  </p>
                  <p className="mt-1">
                    {date && time
                      ? formatDateTime(combineDateAndTime(date, time))
                      : "—"}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Seu nome *</Label>
                    <Input id="clientName" {...register("clientName")} />
                    {errors.clientName && (
                      <p className="text-sm text-rose-600">
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
                      <p className="text-sm text-rose-600">
                        {errors.clientPhone.message}
                      </p>
                    )}
                  </div>
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
