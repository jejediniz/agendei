import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Wallet,
  Users,
  UserCog,
  Scissors,
  TrendingUp,
} from "lucide-react";
import { requireSessionContext } from "@/lib/tenant/context";
import { getReportsData } from "@/lib/queries/reports";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/currency";

export default async function RelatoriosPage() {
  const ctx = await requireSessionContext();
  const data = await getReportsData(ctx.organizationId);

  const hasServices = data.topServices.length > 0;
  const maxServiceCount = hasServices ? data.topServices[0].count : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Relatórios"
        description={`Indicadores do seu negócio nos últimos ${data.periodDays} dias`}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Atendimentos e faturamento
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            compact
            title={`Atendimentos (${data.periodDays}d)`}
            value={data.totalAppointments}
            icon={CalendarCheck}
          />
          <StatCard
            compact
            title="Concluídos"
            value={data.completed}
            icon={CheckCircle2}
          />
          <StatCard
            compact
            title="Cancelados"
            value={data.cancelled}
            icon={XCircle}
          />
          <StatCard
            compact
            title="Faturamento realizado"
            value={formatCurrency(data.revenueRealized)}
            icon={Wallet}
            description={`Previsto: ${formatCurrency(data.revenueProjected)}`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Serviços mais agendados
        </h2>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-warm">
          {hasServices ? (
            <ul className="space-y-4">
              {data.topServices.map((service) => (
                <li key={service.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-foreground">
                      {service.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {service.count}{" "}
                      {service.count === 1 ? "agendamento" : "agendamentos"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.round(
                          (service.count / maxServiceCount) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Ainda não há agendamentos no período para gerar este ranking.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Cadastros
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            compact
            title="Clientes"
            value={data.clientsCount}
            icon={Users}
          />
          <StatCard
            compact
            title="Profissionais ativos"
            value={data.professionalsCount}
            icon={UserCog}
          />
          <StatCard
            compact
            title="Serviços ativos"
            value={data.servicesCount}
            icon={Scissors}
          />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Em breve: taxa de ocupação da agenda, recorrência de clientes e índice de
        faltas (no-show).
      </p>
    </div>
  );
}
