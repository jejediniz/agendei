import Link from "next/link";
import { CalendarClock, Clock } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { formatDate, formatTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";

type NextAppointmentHeroProps = {
  appointment: AppointmentWithRelations | null;
};

export function NextAppointmentHero({ appointment }: NextAppointmentHeroProps) {
  if (!appointment) {
    return (
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary-light/30">
        <CardContent className="p-6 sm:p-8">
          <EmptyState
            compact
            icon={CalendarClock}
            title="Nenhum atendimento próximo"
            description="Quando houver agendamentos marcados ou confirmados, o próximo aparecerá aqui para você se preparar."
            action={
              <Button asChild>
                <Link href="/agendamentos/novo">Criar agendamento</Link>
              </Button>
            }
            className="border-none bg-transparent"
          />
        </CardContent>
      </Card>
    );
  }

  const isToday =
    formatDate(appointment.startAt) === formatDate(new Date());

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary-light/25 shadow-warm-md">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4 sm:gap-5">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-warm sm:px-5">
              <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                {isToday ? "Hoje" : formatDate(appointment.startAt, "EEE")}
              </span>
              <span className="font-display text-3xl font-bold tabular-nums sm:text-4xl">
                {formatTime(appointment.startAt)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Próximo atendimento
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={appointment.client.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {appointment.client.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {appointment.service.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/70" />
                  {appointment.professional.name}
                </span>
                {!isToday && (
                  <span>{formatDate(appointment.startAt, "dd 'de' MMMM")}</span>
                )}
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button asChild className="w-full sm:w-auto lg:w-full">
              <Link href="/agenda">Ver agenda de hoje</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto lg:w-full"
            >
              <Link href="/agendamentos">Todos os agendamentos</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
