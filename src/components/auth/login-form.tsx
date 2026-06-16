"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AccountType } from "@prisma/client";
import { BriefcaseBusiness, CalendarCheck } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils/cn";
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
import {
  BUSINESS_ON_CUSTOMER_ERROR,
  CUSTOMER_ON_BUSINESS_ERROR,
} from "@/lib/auth/account-guards";

type LoginArea = "negocio" | "cliente";

function AreaTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof BriefcaseBusiness;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-center transition-colors",
        active
          ? "bg-teal-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState<LoginArea>(
    searchParams.get("area") === "cliente" ? "cliente" : "negocio",
  );
  const customerCallbackUrl =
    searchParams.get("callbackUrl") ?? "/login?area=cliente";
  const isCustomerLoggedIn =
    status === "authenticated" &&
    session?.user?.accountType === AccountType.CUSTOMER;
  const isBusinessLoggedIn =
    status === "authenticated" &&
    session?.user?.accountType === AccountType.BUSINESS;

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "ContaEmpresa") {
      setArea("cliente");
      toast.error(BUSINESS_ON_CUSTOMER_ERROR);
      return;
    }
    if (error === "ContaPlataforma") {
      setArea("negocio");
      toast.error("Esta conta é de administrador da plataforma.");
      return;
    }
    if (error) {
      toast.error("Não foi possível entrar com Google. Tente novamente.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isBusinessLoggedIn || !session?.user.organizationId) return;
    router.replace("/");
  }, [isBusinessLoggedIn, session?.user.organizationId, router]);

  useEffect(() => {
    if (!isCustomerLoggedIn) return;
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl !== "/login") {
      router.replace(callbackUrl);
    }
  }, [isCustomerLoggedIn, searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    formState: { errors: customerErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onBusinessSubmit(data: LoginFormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      loginIntent: "business",
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(
        `E-mail ou senha incorretos. ${CUSTOMER_ON_BUSINESS_ERROR}`,
      );
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push("/");
    router.refresh();
  }

  async function onCustomerSubmit(data: LoginFormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      loginIntent: "customer",
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(
        `E-mail ou senha incorretos. ${BUSINESS_ON_CUSTOMER_ERROR}`,
      );
      return;
    }

    toast.success("Login realizado com sucesso!");
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl ?? "/login?area=cliente");
    router.refresh();
  }

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (isBusinessLoggedIn && session?.user.organizationId) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (isBusinessLoggedIn && !session?.user.organizationId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
            <BriefcaseBusiness className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle className="text-2xl text-teal-600">Área do negócio</CardTitle>
          <CardDescription>Conectado como {session.user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-sm text-slate-600">
            Sua conta ainda não tem um negócio configurado. Continue o cadastro
            ou saia para entrar com outra conta.
          </p>
          <Button className="w-full" asChild>
            <Link href="/onboarding">Continuar configuração</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCustomerLoggedIn) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
            <CalendarCheck className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle className="text-2xl text-teal-600">Área do cliente</CardTitle>
          <CardDescription>Conectado como {session.user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-slate-600">
            Acesse o link de agendamento do estabelecimento e clique em{" "}
            <span className="font-medium">Meus agendamentos</span> para ver ou
            cancelar seus horários.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login?area=negocio" })}
          >
            Sair e entrar como negócio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-teal-600">Agendei</CardTitle>
        <CardDescription>Como você quer entrar?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <AreaTab
            active={area === "negocio"}
            onClick={() => setArea("negocio")}
            icon={BriefcaseBusiness}
            label="Tenho um negócio"
          />
          <AreaTab
            active={area === "cliente"}
            onClick={() => setArea("cliente")}
            icon={CalendarCheck}
            label="Sou cliente"
          />
        </div>

        {area === "negocio" ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Acesse o painel para gerenciar agenda, serviços, equipe e
              clientes do seu estabelecimento.
            </div>

            <GoogleSignInButton
              intent="business"
              callbackUrl="/onboarding"
              label="Continuar com Google"
              className="w-full"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-rose-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-rose-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar no painel"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="text-teal-600 hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">
              Entre para acompanhar os agendamentos que você fez em salões,
              clínicas e outros estabelecimentos.
            </div>

            <GoogleSignInButton
              intent="customer"
              callbackUrl={customerCallbackUrl}
              label="Continuar com Google"
              className="w-full"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">ou</span>
              </div>
            </div>

            <form
              onSubmit={handleCustomerSubmit(onCustomerSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="customer-email">E-mail</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="seu@email.com"
                  {...registerCustomer("email")}
                />
                {customerErrors.email && (
                  <p className="text-sm text-rose-600">
                    {customerErrors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-password">Senha</Label>
                <Input
                  id="customer-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerCustomer("password")}
                />
                {customerErrors.password && (
                  <p className="text-sm text-rose-600">
                    {customerErrors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Não tem conta?{" "}
              <Link
                href={`/cadastro-cliente?callbackUrl=${encodeURIComponent(customerCallbackUrl)}`}
                className="text-teal-600 hover:underline"
              >
                Criar conta grátis
              </Link>
            </p>

            <p className="text-center text-xs text-slate-500">
              Depois do login, acesse o link do estabelecimento e abra{" "}
              <span className="font-medium text-slate-600">
                Meus agendamentos
              </span>
              .
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
