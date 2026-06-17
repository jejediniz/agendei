"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import { createService, updateService } from "@/lib/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type ServiceFormProps = {
  defaultValues?: ServiceFormData;
  serviceId?: string;
  redirectTo?: string;
};

export function ServiceForm({
  defaultValues,
  serviceId,
  redirectTo = "/servicos",
}: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!serviceId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      durationMin: 30,
      price: 0,
      active: true,
    },
  });

  async function onSubmit(data: ServiceFormData) {
    setLoading(true);
    const result = isEditing
      ? await updateService(serviceId, data)
      : await createService(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar serviço.");
      return;
    }

    toast.success(isEditing ? "Serviço atualizado!" : "Serviço cadastrado!");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome do serviço *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-rose-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duração (minutos) *</Label>
              <Input id="durationMin" type="number" min={5} {...register("durationMin", { valueAsNumber: true })} />
              {errors.durationMin && (
                <p className="text-sm text-rose-600">{errors.durationMin.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input id="price" type="number" step="0.01" min={0} {...register("price", { valueAsNumber: true })} />
              {errors.price && (
                <p className="text-sm text-rose-600">{errors.price.message}</p>
              )}
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                  )}
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar serviço"}
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
