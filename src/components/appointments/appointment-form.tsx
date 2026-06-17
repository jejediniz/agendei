"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Client, Professional } from "@prisma/client";
import type { SerializableService } from "@/lib/queries/services";
import {
  appointmentSchema,
  type AppointmentFormData,
} from "@/lib/validations/appointment";
import {
  createAppointment,
  getAvailableSlots,
} from "@/lib/actions/appointments";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AgendaWeekStrip } from "@/components/agenda/agenda-week-strip";
import { ProfessionalSlotTimeGrid } from "@/components/booking/professional-slot-time-grid";

type AppointmentFormProps = {
  clients: Client[];
  professionals: Professional[];
  services: SerializableService[];
};

export function AppointmentForm({
  clients,
  professionals,
  services,
}: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slotsByProfessional, setSlotsByProfessional] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      professionalId: "",
      serviceId: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const professionalId = watch("professionalId");
  const serviceId = watch("serviceId");
  const date = watch("date");
  const time = watch("time");
  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    async function loadSlots() {
      if (!serviceId || !date) {
        setSlotsByProfessional({});
        return;
      }
      setLoadingSlots(true);
      const results = await Promise.all(
        professionals
          .filter((p) => p.active)
          .map(async (professional) => {
            const result = await getAvailableSlots(
              professional.id,
              serviceId,
              date,
            );
            return { professionalId: professional.id, slots: result.slots };
          }),
      );
      setLoadingSlots(false);

      const map: Record<string, string[]> = {};
      for (const result of results) {
        map[result.professionalId] = result.slots;
      }
      setSlotsByProfessional(map);

      if (professionalId && time && !(map[professionalId]?.includes(time))) {
        setValue("professionalId", "");
        setValue("time", "");
      }
    }
    loadSlots();
  }, [serviceId, date, professionals, setValue, professionalId, time]);

  async function onSubmit(data: AppointmentFormData) {
    setLoading(true);
    const result = await createAppointment(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar agendamento.");
      return;
    }

    toast.success("Agendamento criado!");
    router.push("/agendamentos");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.clientId && (
                <p className="text-sm text-rose-600">{errors.clientId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("professionalId", "");
                      setValue("time", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.durationMin}min — {formatCurrency(s.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceId && (
                <p className="text-sm text-rose-600">{errors.serviceId.message}</p>
              )}
              {selectedService && (
                <p className="text-xs text-muted-foreground">
                  Duração: {selectedService.durationMin} min · Preço:{" "}
                  {formatCurrency(selectedService.price)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Data, profissional e horário *</Label>
            {!serviceId ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Selecione o serviço para escolher data e horário.
              </p>
            ) : (
              <div className="space-y-4">
                <AgendaWeekStrip
                  selectedDate={date || format(new Date(), "yyyy-MM-dd")}
                  onDateChange={(value) => {
                    setValue("date", value, { shouldValidate: true });
                    setValue("professionalId", "");
                    setValue("time", "");
                  }}
                />
                {!date ? (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    Selecione uma data acima.
                  </p>
                ) : (
                  <ProfessionalSlotTimeGrid
                    professionals={professionals}
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
                  <p className="text-sm text-rose-600">{errors.date.message}</p>
                )}
                {errors.professionalId && (
                  <p className="text-sm text-rose-600">
                    {errors.professionalId.message}
                  </p>
                )}
                {errors.time && (
                  <p className="text-sm text-rose-600">{errors.time.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Agendando..." : "Criar agendamento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
