"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  createOrganizationSchema,
  type CreateOrganizationData,
} from "@/lib/validations/organization";
import { createOrganizationForCurrentUser } from "@/lib/actions/organization";
import { syncSessionAndNavigate } from "@/lib/auth/sync-session";
import { slugify } from "@/lib/utils/slug";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrganizationSetupForm() {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      businessName: "",
      slug: "",
      businessType: "OTHER",
    },
  });

  const businessName = watch("businessName");

  function handleBusinessNameChange(value: string) {
    setValue("businessName", value);
    if (!watch("slug") || watch("slug") === slugify(businessName)) {
      setValue("slug", slugify(value));
    }
  }

  async function onSubmit(data: CreateOrganizationData) {
    setLoading(true);
    const result = await createOrganizationForCurrentUser(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar negócio.");
      return;
    }

    toast.success("Negócio criado! Vamos configurar tudo.");
    await syncSessionAndNavigate(update, "/onboarding");
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle>Configure seu negócio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do negócio *</Label>
            <Input
              id="businessName"
              {...register("businessName")}
              onChange={(e) => handleBusinessNameChange(e.target.value)}
            />
            {errors.businessName && (
              <p className="text-sm text-rose-600">{errors.businessName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Endereço do negócio *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">agendei.com/</span>
              <Input id="slug" {...register("slug")} />
            </div>
            {errors.slug && (
              <p className="text-sm text-rose-600">{errors.slug.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tipo de negócio *</Label>
            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
