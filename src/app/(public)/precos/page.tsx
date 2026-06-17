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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-display text-xl font-semibold text-primary"
          >
            Agendei
          </Link>
          <div className="flex gap-3">
            <PrecosHeaderActions />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Preços
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground">
            Simples, transparente e sem surpresas
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            14 dias grátis para testar. Cancele quando quiser, sem burocracia.
          </p>
        </div>

        <div className="mt-14 flex justify-center">
          <Card className="w-full max-w-md border-primary/20">
            <CardHeader className="text-center">
              <CardTitle>Plano Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center">
                <span className="font-display text-5xl font-bold text-foreground">
                  {formatCurrency(price)}
                </span>
                <span className="text-base text-muted-foreground">/mês</span>
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Agendamentos ilimitados",
                  "Profissionais e serviços",
                  "Dashboard e agenda visual",
                  "Suporte por e-mail",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-light">
                      <Check className="h-3 w-3 text-accent" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/cadastro">Começar trial de 14 dias</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
