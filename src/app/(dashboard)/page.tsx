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
import { NextAppointmentHero } from "@/components/dashboard/next-appointment-hero";
import { DashboardAppointmentList } from "@/components/dashboard/dashboard-appointment-list";
import { SubscriptionBanner } from "@/components/billing/subscription-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const ctx = await requireSessionContext();
  const data = await getDashboardData(ctx.organizationId);
  const nextAppointment = data.upcomingAppointments[0] ?? null;

  return (
    <div className="space-y-8">
      <SubscriptionBanner />

      <NextAppointmentHero appointment={nextAppointment} />

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Agenda de hoje</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.todayAppointments.length === 0
                  ? "Seu dia está livre por enquanto"
                  : `${data.todayAppointments.length} atendimento${data.todayAppointments.length === 1 ? "" : "s"} programado${data.todayAppointments.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agenda">Abrir agenda</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DashboardAppointmentList
              appointments={data.todayAppointments}
              emptyTitle="Nenhum agendamento para hoje"
              emptyDescription="Quando seus clientes marcarem horários, eles aparecerão aqui. Você também pode criar um agendamento manualmente."
              emptyActionHref="/agendamentos/novo"
              emptyActionLabel="Criar agendamento"
              highlightNext
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Próximos atendimentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Agendamentos marcados e confirmados
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agendamentos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DashboardAppointmentList
              appointments={data.upcomingAppointments.slice(0, 5)}
              emptyTitle="Nenhum atendimento próximo"
              emptyDescription="Os próximos horários confirmados ou pendentes aparecerão nesta lista."
              emptyActionHref="/agendamentos/novo"
              emptyActionLabel="Criar agendamento"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          Resumo do negócio
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          <StatCard
            compact
            title="Agendamentos hoje"
            value={data.stats.todayCount}
            icon={Calendar}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <StatCard
            compact
            title="Confirmados"
            value={data.stats.confirmedCount}
            icon={CheckCircle}
            description="Total de agendamentos confirmados"
          />
          <StatCard
            compact
            title="Cancelados"
            value={data.stats.cancelledCount}
            icon={XCircle}
            description="Total de agendamentos cancelados"
          />
        </div>
      </div>
    </div>
  );
}
