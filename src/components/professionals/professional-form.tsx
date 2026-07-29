"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  professionalSchema,
  type ProfessionalFormData,
} from "@/lib/validations/professional";
import { createProfessional, updateProfessional } from "@/lib/actions/professionals";
import type { SerializableService } from "@/lib/queries/services";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type ProfessionalFormProps = {
  defaultValues?: ProfessionalFormData;
  professionalId?: string;
  redirectTo?: string;
  services?: SerializableService[];
};

export function ProfessionalForm({
  defaultValues,
  professionalId,
  redirectTo = "/profissionais",
  services = [],
}: ProfessionalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!professionalId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: defaultValues ?? {
      name: "",
      phone: "",
      email: "",
      specialty: "",
      active: true,
      serviceIds: [],
    },
  });

  async function onSubmit(data: ProfessionalFormData) {
    setLoading(true);
    const result = isEditing
      ? await updateProfessional(professionalId, data)
      : await createProfessional(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar profissional.");
      return;
    }

    toast.success(isEditing ? "Profissional atualizado!" : "Profissional cadastrado!");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-rose-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input id="specialty" placeholder="Ex: Cabeleireira, Barbeiro..." {...register("specialty")} />
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
                <Label htmlFor="active">Profissional ativo</Label>
              </div>
            )}
          </div>

          {services.length > 0 && (
            <div className="space-y-2">
              <Label>Serviços que realiza</Label>
              <p className="text-xs text-muted-foreground">
                Deixe sem seleção para que o profissional atenda todos os
                serviços.
              </p>
              <Controller
                name="serviceIds"
                control={control}
                render={({ field }) => {
                  const selected = field.value ?? [];
                  return (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {services.map((service) => {
                        const checked = selected.includes(service.id);
                        return (
                          <label
                            key={service.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                              checked
                                ? "border-primary/40 bg-primary-light/40"
                                : "border-border bg-card hover:bg-muted/50",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...selected, service.id]);
                                } else {
                                  field.onChange(
                                    selected.filter((id) => id !== service.id),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-border text-primary"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-foreground">
                                {service.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {service.durationMin} min ·{" "}
                                {formatCurrency(service.price)}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar profissional"}
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
