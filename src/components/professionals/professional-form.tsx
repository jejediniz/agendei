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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type ProfessionalFormProps = {
  defaultValues?: ProfessionalFormData;
  professionalId?: string;
  redirectTo?: string;
};

export function ProfessionalForm({
  defaultValues,
  professionalId,
  redirectTo = "/profissionais",
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
