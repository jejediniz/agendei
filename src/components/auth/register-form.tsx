"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  registerOrganizationSchema,
  type RegisterOrganizationData,
} from "@/lib/validations/organization";
import { registerOrganization } from "@/lib/actions/auth";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterOrganizationData>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
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

  async function onSubmit(data: RegisterOrganizationData) {
    setLoading(true);
    const result = await registerOrganization(data);
    if (!result.success) {
      setLoading(false);
      toast.error(result.error ?? "Erro ao criar conta.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (signInResult?.error) {
      toast.error("Conta criada, mas falha no login. Tente entrar manualmente.");
      router.push("/login");
      return;
    }

    toast.success("Conta criada! Bem-vindo ao Agendei.");
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl text-primary">Criar conta de negócio</CardTitle>
        <CardDescription>
          14 dias grátis para configurar agenda, serviços e equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GoogleSignInButton
          intent="business"
          callbackUrl="/onboarding"
          label="Começar com Google"
          className="w-full"
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-rose-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-rose-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-rose-600">{errors.password.message}</p>
            )}
          </div>
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
              <span className="text-sm text-muted-foreground">agendei.com/</span>
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
            {loading ? "Criando conta..." : "Começar trial gratuito"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            É cliente?{" "}
            <Link
              href="/cadastro-cliente"
              className="text-primary hover:underline"
            >
              Criar conta de cliente
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
