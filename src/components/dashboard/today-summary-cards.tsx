import {
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  CheckCheck,
  XCircle,
  DollarSign,
} from "lucide-react";
import type { TodayDashboardStats } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils/currency";
import { StatCard } from "@/components/dashboard/stat-card";

type TodaySummaryCardsProps = {
  stats: TodayDashboardStats;
};

export function TodaySummaryCards({ stats }: TodaySummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <StatCard compact title="Agendamentos hoje" value={stats.total} icon={Calendar} />
      <StatCard compact title="Marcados" value={stats.scheduled} icon={Clock} />
      <StatCard compact title="Confirmados" value={stats.confirmed} icon={CheckCircle} />
      <StatCard
        compact
        title="Em atendimento"
        value={stats.inProgress}
        icon={PlayCircle}
      />
      <StatCard compact title="Concluídos" value={stats.completed} icon={CheckCheck} />
      <StatCard compact title="Cancelados" value={stats.cancelled} icon={XCircle} />
      <StatCard compact title="Não compareceu" value={stats.noShow} icon={XCircle} />
      <StatCard
        compact
        title="Receita prevista"
        value={formatCurrency(stats.projectedRevenue)}
        icon={DollarSign}
      />
    </div>
  );
}
