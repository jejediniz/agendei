import Link from "next/link";
import { Users, UserCog, Scissors } from "lucide-react";
import { requireSessionContext } from "@/lib/tenant/context";
import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardDayView } from "@/components/dashboard/dashboard-day-view";
import { SubscriptionBanner } from "@/components/billing/subscription-banner";

export default async function DashboardPage() {
  const ctx = await requireSessionContext();
  const data = await getDashboardData(ctx.organizationId);

  return (
    <div className="space-y-8">
      <SubscriptionBanner />

      <DashboardDayView
        todayAppointments={data.todayAppointments}
        todayStats={data.todayStats}
        nextTodayAppointment={data.nextTodayAppointment}
      />

      <section className="border-t border-border/60 pt-8">
        <h2 className="mb-4 font-display text-base font-semibold text-muted-foreground">
          Resumo do negócio
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
        <p className="mt-3 text-xs text-muted-foreground">
          <Link href="/agendamentos" className="text-primary hover:underline">
            Ver todos os agendamentos →
          </Link>
        </p>
      </section>
    </div>
  );
}
