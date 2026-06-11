"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BusinessType } from "@prisma/client";
import {
  updateOrganizationSchema,
  type UpdateOrganizationData,
} from "@/lib/validations/organization";
import { updateOrganization } from "@/lib/actions/organization";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/constants/business";
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
import { Card, CardContent } from "@/components/ui/card";

type OrganizationFormProps = {
  defaultValues: UpdateOrganizationData;
};

export function OrganizationForm({ defaultValues }: OrganizationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateOrganizationData>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues,
  });

  async function onSubmit(data: UpdateOrganizationData) {
    setLoading(true);
    const result = await updateOrganization(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar.");
      return;
    }

    toast.success("Negócio atualizado!");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do negócio *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-rose-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tipo de negócio *</Label>
            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as BusinessType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgEmail">E-mail do negócio</Label>
              <Input id="orgEmail" type="email" {...register("email")} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
