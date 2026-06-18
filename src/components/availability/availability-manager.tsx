"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Availability, Professional } from "@prisma/client";
import {
  availabilitySchema,
  type AvailabilityFormData,
} from "@/lib/validations/availability";
import {
  createAvailability,
  deleteAvailability,
  toggleAvailabilityActive,
} from "@/lib/actions/availability";
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_OPTIONS } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";

type AvailabilityWithProfessional = Availability & {
  professional: Professional;
};

type AvailabilityManagerProps = {
  professionals: Professional[];
  availabilities: AvailabilityWithProfessional[];
  selectedProfessionalId?: string;
};

export function AvailabilityManager({
  professionals,
  availabilities,
  selectedProfessionalId,
}: AvailabilityManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterId, setFilterId] = useState(selectedProfessionalId ?? "all");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      professionalId: selectedProfessionalId ?? "",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    },
  });

  async function onSubmit(data: AvailabilityFormData) {
    setLoading(true);
    const result = await createAvailability(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar horário.");
      return;
    }

    toast.success("Horário cadastrado!");
    reset({
      professionalId: data.professionalId,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "18:00",
      active: true,
    });
    router.refresh();
  }

  async function handleToggle(id: string) {
    const result = await toggleAvailabilityActive(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Status atualizado.");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const result = await deleteAvailability(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Horário removido.");
    router.refresh();
  }

  const filtered =
    filterId === "all"
      ? availabilities
      : availabilities.filter((a) => a.professionalId === filterId);

  const grouped = filtered.reduce(
    (acc, item) => {
      const key = item.professional.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, AvailabilityWithProfessional[]>,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo horário disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <Label>Profissional *</Label>
              <Controller
                name="professionalId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
              <Label>Dia da semana *</Label>
              <Controller
                name="dayOfWeek"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_OF_WEEK_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Início *</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fim *</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-rose-600">{errors.endTime.message}</p>
              )}
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-5">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Adicionar horário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Label>Filtrar por profissional:</Label>
        <Select
          value={filterId}
          onValueChange={(v) => {
            setFilterId(v);
            const params = new URLSearchParams();
            if (v !== "all") params.set("profissional", v);
            router.replace(`/horarios?${params.toString()}`);
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nenhum horário cadastrado"
          description="Defina os dias e horários de atendimento de cada profissional para liberar agendamentos."
        />
      ) : (
        Object.entries(grouped).map(([name, items]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-foreground">
                      {DAY_OF_WEEK_LABELS[item.dayOfWeek]}
                    </span>
                    <span className="text-muted-foreground">
                      {item.startTime} — {item.endTime}
                    </span>
                    <Badge variant={item.active ? "success" : "secondary"}>
                      {item.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(item.id)}
                    >
                      {item.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir horário"
        description="Excluir este horário? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
