"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Client, Professional, Service } from "@prisma/client";
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
import { Input } from "@/components/ui/input";
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

type AppointmentFormProps = {
  clients: Client[];
  professionals: Professional[];
  services: Service[];
};

export function AppointmentForm({
  clients,
  professionals,
  services,
}: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
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
  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    async function loadSlots() {
      if (!professionalId || !serviceId || !date) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      const result = await getAvailableSlots(professionalId, serviceId, date);
      setLoadingSlots(false);
      setSlots(result.slots);
      if (result.error && result.slots.length === 0) {
        toast.error(result.error);
      }
      setValue("time", "");
    }
    loadSlots();
  }, [professionalId, serviceId, date, setValue]);

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label>Profissional *</Label>
              <Controller
                name="professionalId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.professionalId && (
                <p className="text-sm text-rose-600">{errors.professionalId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.durationMin}min — {formatCurrency(s.price.toString())}
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
                <p className="text-xs text-slate-500">
                  Duração: {selectedService.durationMin} min · Preço:{" "}
                  {formatCurrency(selectedService.price.toString())}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" {...register("date")} />
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
                              ? "Selecione profissional, serviço e data"
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Agendando..." : "Criar agendamento"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
