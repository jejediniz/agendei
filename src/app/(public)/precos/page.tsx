import Link from "next/link";
import { Check } from "lucide-react";
import { getSubscriptionPrice } from "@/lib/billing/asaas";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrecosHeaderActions } from "@/components/auth/precos-header-actions";

export default function PrecosPage() {
  const price = getSubscriptionPrice();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-teal-600">
            Agendei
          </Link>
          <div className="flex gap-3">
            <PrecosHeaderActions />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Simples, transparente e sem surpresas
          </h1>
          <p className="mt-3 text-slate-600">
            14 dias grátis para testar. Cancele quando quiser.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Plano Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-4xl font-bold text-slate-900">
                {formatCurrency(price)}
                <span className="text-base font-normal text-slate-500">/mês</span>
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "Agendamentos ilimitados",
                  "Profissionais e serviços",
                  "Dashboard e agenda visual",
                  "Suporte por e-mail",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/cadastro">Começar trial de 14 dias</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
