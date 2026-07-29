"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  registerCustomerSchema,
  type RegisterCustomerData,
} from "@/lib/validations/auth";
import { registerCustomer } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/login?area=cliente";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCustomerData>({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: RegisterCustomerData) {
    setLoading(true);
    const result = await registerCustomer(data);
    if (!result.success) {
      setLoading(false);
      toast.error(result.error ?? "Erro ao criar conta.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      loginIntent: "customer",
      redirect: false,
    });
    setLoading(false);

    if (signInResult?.error) {
      toast.error("Conta criada, mas falha no login. Tente entrar manualmente.");
      router.push(`/login?area=cliente&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    toast.success("Conta criada com sucesso!");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl text-primary">Criar conta de cliente</CardTitle>
        <CardDescription>
          Acompanhe e gerencie seus agendamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GoogleSignInButton
          intent="customer"
          callbackUrl={callbackUrl}
          label="Continuar com Google"
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
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href={`/login?area=cliente&callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Tem um negócio?{" "}
            <Link href="/cadastro" className="text-primary hover:underline">
              Criar conta de negócio
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
