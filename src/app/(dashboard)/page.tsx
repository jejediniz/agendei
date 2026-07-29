import Link from "next/link";
import { CalendarDays, BarChart3 } from "lucide-react";
import { requireSessionContext } from "@/lib/tenant/context";
import { getDashboardData } from "@/lib/queries/dashboard";
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

      <section className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row">
        <Link
          href="/agenda"
          className="flex flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-warm transition-colors hover:border-primary/30 hover:bg-primary-light/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              Abrir a agenda
            </span>
            <span className="block text-xs text-muted-foreground">
              Calendário e lista de agendamentos
            </span>
          </span>
        </Link>
        <Link
          href="/relatorios"
          className="flex flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-warm transition-colors hover:border-primary/30 hover:bg-primary-light/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              Ver relatórios
            </span>
            <span className="block text-xs text-muted-foreground">
              Faturamento e serviços mais procurados
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
