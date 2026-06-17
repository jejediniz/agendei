import Link from "next/link";
import { CalendarX } from "lucide-react";
import type { PublicOrganization } from "@/lib/queries/public-booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BookingUnavailableProps = {
  organization?: Pick<PublicOrganization, "name">;
  reason?: "subscription" | "no-data";
};

export function BookingUnavailable({
  organization,
  reason = "subscription",
}: BookingUnavailableProps) {
  const title =
    reason === "no-data"
      ? "Agendamento em configuração"
      : "Agendamento indisponível";

  const description =
    reason === "no-data"
      ? "Este estabelecimento ainda está configurando serviços e profissionais. Tente novamente em breve."
      : "O agendamento online não está disponível no momento. Entre em contato diretamente com o estabelecimento.";

  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <CalendarX className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {organization && (
          <p className="mt-1 text-sm text-muted-foreground">{organization.name}</p>
        )}
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
