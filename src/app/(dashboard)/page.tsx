import Link from "next/link";
import {
  Users,
  UserCog,
  Scissors,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { requireSessionContext } from "@/lib/tenant/context";
import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/appointments/status-badge";
import { SubscriptionBanner } from "@/components/billing/subscription-banner";
import { formatDateTime } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const ctx = await requireSessionContext();
  const data = await getDashboardData(ctx.organizationId);

  return (
    <div className="space-y-8">
      <div>
        <SubscriptionBanner />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Clientes" value={data.clientsCount} icon={Users} />
        <StatCard
          title="Profissionais ativos"
          value={data.professionalsCount}
          icon={UserCog}
        />
        <StatCard
          title="Serviços ativos"
          value={data.servicesCount}
          icon={Scissors}
        />
        <StatCard
          title="Agendamentos hoje"
          value={data.stats.todayCount}
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Confirmados"
          value={data.stats.confirmedCount}
          icon={CheckCircle}
          description="Total de agendamentos confirmados"
        />
        <StatCard
          title="Cancelados"
          value={data.stats.cancelledCount}
          icon={XCircle}
          description="Total de agendamentos cancelados"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Agendamentos de hoje</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agenda">Ver agenda</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum agendamento hoje.</p>
            ) : (
              data.todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{apt.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(apt.startAt)} · {apt.professional.name}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Próximos atendimentos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agendamentos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum atendimento próximo.</p>
            ) : (
              data.upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{apt.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(apt.startAt)} · {apt.service.name}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
