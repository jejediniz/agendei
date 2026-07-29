"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import type { TodayDashboardStats } from "@/lib/queries/dashboard";
import { formatDate } from "@/lib/utils/date";
import { AppointmentDetailDialog } from "@/components/appointments/appointment-detail-dialog";
import { NextAppointmentHero } from "@/components/dashboard/next-appointment-hero";
import { TodayAppointmentsList } from "@/components/dashboard/today-appointments-list";
import {
  TodayStatusFilter,
  type TodayStatusFilterValue,
} from "@/components/dashboard/today-status-filter";
import { TodaySummaryCards } from "@/components/dashboard/today-summary-cards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";

type DashboardDayViewProps = {
  todayAppointments: AppointmentWithRelations[];
  todayStats: TodayDashboardStats;
  nextTodayAppointment: AppointmentWithRelations | null;
};

export function DashboardDayView({
  todayAppointments,
  todayStats,
  nextTodayAppointment,
}: DashboardDayViewProps) {
  const [statusFilter, setStatusFilter] = useState<TodayStatusFilterValue>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return todayAppointments;
    return todayAppointments.filter((apt) => apt.status === statusFilter);
  }, [todayAppointments, statusFilter]);

  const hasAppointmentsToday = todayAppointments.length > 0;
  const hasFilteredResults = filteredAppointments.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Agenda de hoje
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {formatDate(new Date(), "EEEE, dd 'de' MMMM")}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Veja os atendimentos de hoje, acompanhe o próximo horário e atualize o
            status dos agendamentos.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agenda">Ver agenda completa</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/agendamentos/novo">Novo agendamento</Link>
          </Button>
        </div>
      </header>

      <TodaySummaryCards stats={todayStats} />

      <NextAppointmentHero
        appointment={nextTodayAppointment}
        onViewDetails={setSelectedAppointment}
      />

      {hasAppointmentsToday && (
        <section className="space-y-4">
          <TodayStatusFilter value={statusFilter} onChange={setStatusFilter} />

          {hasFilteredResults ? (
            <TodayAppointmentsList
              appointments={filteredAppointments}
              highlightId={nextTodayAppointment?.id}
              onAppointmentClick={setSelectedAppointment}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhum agendamento encontrado para este status.
            </div>
          )}
        </section>
      )}

      {!hasAppointmentsToday && (
        <EmptyState
          icon={Calendar}
          title="Nenhum agendamento para hoje"
          description="Quando seus clientes marcarem horários, eles aparecerão aqui. Você também pode criar um agendamento manualmente."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/agendamentos/novo">Novo agendamento</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/agenda">Ver agenda completa</Link>
              </Button>
            </div>
          }
        />
      )}

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={selectedAppointment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
